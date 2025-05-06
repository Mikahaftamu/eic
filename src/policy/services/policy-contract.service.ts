import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In, Between, LessThan } from 'typeorm';
import { PolicyContract } from '../entities/policy-contract.entity';
import { CreatePolicyContractDto } from '../dto/create-policy-contract.dto';
import { UpdatePolicyContractDto } from '../dto/update-policy-contract.dto';
import { ContractStatus } from '../enums/contract-status.enum';
import { PaymentStatus } from '../enums/payment-status.enum';
import { CancellationReason } from '../enums/cancellation-reason.enum';
import { PolicyProduct } from '../entities/policy-product.entity';
import { Member } from '../../members/entities/member.entity';

@Injectable()
export class PolicyContractService
{
  private readonly logger = new Logger(PolicyContractService.name);

  constructor(
    @InjectRepository(PolicyContract)
    private readonly policyContractRepository: Repository<PolicyContract>,
    @InjectRepository(PolicyProduct)
    private readonly policyProductRepository: Repository<PolicyProduct>,
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
    private readonly dataSource: DataSource,
  ) { }

  async create(
    insuranceCompanyId: string,
    createDto: CreatePolicyContractDto,
  ): Promise<PolicyContract>
  {
    // Start a transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try
    {
      // Validate policy product exists and belongs to insurance company
      const policyProduct = await this.policyProductRepository.findOne({
        where: {
          id: createDto.policyProductId,
          insuranceCompanyId,
        },
      });
      if (!policyProduct)
      {
        throw new NotFoundException('Policy product not found');
      }

      // Validate primary member exists and belongs to insurance company
      const primaryMember = await this.memberRepository.findOne({
        where: {
          id: createDto.primaryMemberId,
          insuranceCompanyId,
        },
      });
      if (!primaryMember)
      {
        throw new NotFoundException('Primary member not found');
      }

      // Validate dependent members if any
      if (createDto.dependentMemberIds?.length)
      {
        const dependents = await this.memberRepository.find({
          where: {
            id: In(createDto.dependentMemberIds),
            insuranceCompanyId,
          },
        });
        if (dependents.length !== createDto.dependentMemberIds.length)
        {
          throw new NotFoundException('One or more dependent members not found');
        }
      }

      // Generate contract number and policy number
      const contractNumber = await this.generateContractNumber(insuranceCompanyId);
      const policyNumber = await this.generatePolicyNumber(insuranceCompanyId);

      // Create policy contract
      const contract = this.policyContractRepository.create({
        ...createDto,
        contractNumber,
        policyNumber,
        insuranceCompanyId,
        status: ContractStatus.DRAFT,
        paymentStatus: PaymentStatus.PENDING,
        nextPremiumDueDate: createDto.effectiveDate,
      });

      // Save contract
      const savedContract = await queryRunner.manager.save(contract);

      // Update member's policy contract reference
      primaryMember.policyProductId = savedContract.id;
      await queryRunner.manager.save(primaryMember);

      if (createDto.dependentMemberIds?.length)
      {
        await queryRunner.manager.update(
          Member,
          { id: In(createDto.dependentMemberIds) },
          { policyProductId: savedContract.id },
        );
      }

      await queryRunner.commitTransaction();
      return savedContract;

    } catch (error)
    {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally
    {
      await queryRunner.release();
    }
  }

  async findAll(insuranceCompanyId: string): Promise<PolicyContract[]>
  {
    return this.policyContractRepository.find({
      where: { insuranceCompanyId },
      relations: ['policyProduct', 'member'],
    });
  }

  async findOne(
    insuranceCompanyId: string,
    id: string,
  ): Promise<PolicyContract>
  {
    const contract = await this.policyContractRepository.findOne({
      where: { id, insuranceCompanyId },
      relations: ['policyProduct', 'member'],
    });

    if (!contract)
    {
      throw new NotFoundException('Policy contract not found');
    }

    return contract;
  }

  async update(
    insuranceCompanyId: string,
    id: string,
    updateDto: UpdatePolicyContractDto,
  ): Promise<PolicyContract>
  {
    const contract = await this.findOne(insuranceCompanyId, id);

    // Validate status transition
    if (updateDto.status)
    {
      this.validateStatusTransition(contract.status, updateDto.status);
    }

    Object.assign(contract, updateDto);
    return this.policyContractRepository.save(contract);
  }

  async cancel(
    insuranceCompanyId: string,
    id: string,
    reason: CancellationReason,
  ): Promise<PolicyContract>
  {
    const contract = await this.findOne(insuranceCompanyId, id);

    if (contract.status === ContractStatus.CANCELLED)
    {
      throw new BadRequestException('Contract is already cancelled');
    }

    contract.status = ContractStatus.CANCELLED;
    contract.cancellationReason = reason;
    contract.cancellationDate = new Date();

    return this.policyContractRepository.save(contract);
  }

  async renew(
    insuranceCompanyId: string,
    id: string,
  ): Promise<PolicyContract>
  {
    const oldContract = await this.findOne(insuranceCompanyId, id);

    if (oldContract.status !== ContractStatus.ACTIVE)
    {
      throw new BadRequestException('Only active contracts can be renewed');
    }

    const renewalDate = new Date(oldContract.endDate);
    renewalDate.setDate(renewalDate.getDate() + 1);

    const endDate = new Date(renewalDate);
    endDate.setFullYear(endDate.getFullYear() + 1);

    const newContract = this.policyContractRepository.create({
      ...oldContract,
      id: undefined,
      policyNumber: await this.generatePolicyNumber(insuranceCompanyId),
      contractNumber: await this.generateContractNumber(insuranceCompanyId),
      status: ContractStatus.DRAFT,
      paymentStatus: PaymentStatus.PENDING,
      effectiveDate: renewalDate,
      endDate: endDate,
      previousContractId: oldContract.id,
      createdAt: undefined,
      updatedAt: undefined,
    });

    // Save the new contract
    const savedNewContract = await this.policyContractRepository.save(newContract);

    // Update the old contract status to RENEWED
    oldContract.status = ContractStatus.RENEWED;
    await this.policyContractRepository.save(oldContract);

    return savedNewContract;
  }

  async updatePaymentStatus(
    insuranceCompanyId: string,
    id: string,
    paymentStatus: PaymentStatus,
    paymentDetails: {
      amount: number;
      transactionId: string;
      method: string;
    },
  ): Promise<PolicyContract>
  {
    const contract = await this.findOne(insuranceCompanyId, id);

    contract.paymentStatus = paymentStatus;
    contract.paymentHistory = [
      ...contract.paymentHistory,
      {
        date: new Date(),
        status: paymentStatus,
        ...paymentDetails,
      },
    ];

    // If payment is completed and contract is in DRAFT, activate it
    if (
      paymentStatus === PaymentStatus.PAID &&
      contract.status === ContractStatus.DRAFT
    )
    {
      contract.status = ContractStatus.ACTIVE;
    }

    return this.policyContractRepository.save(contract);
  }

  async getMemberEnrollmentStats(
    insuranceCompanyId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<{
    newEnrollments: number;
    canceledEnrollments: number;
    netChange: number;
    growthRate: number;
  }>
  {
    // Get new enrollments in the period
    const newEnrollments = await this.policyContractRepository.count({
      where: {
        insuranceCompanyId,
        effectiveDate: Between(startDate, endDate),
        status: ContractStatus.ACTIVE,
      },
    });

    // Get canceled enrollments in the period
    const canceledEnrollments = await this.policyContractRepository.count({
      where: {
        insuranceCompanyId,
        cancellationDate: Between(startDate, endDate),
        status: ContractStatus.CANCELLED,
      },
    });

    // Calculate net change
    const netChange = newEnrollments - canceledEnrollments;

    // Get total active policies at the start of the period
    const totalAtStart = await this.policyContractRepository.count({
      where: {
        insuranceCompanyId,
        effectiveDate: LessThan(startDate),
        status: ContractStatus.ACTIVE,
      },
    });

    // Calculate growth rate
    const growthRate = totalAtStart > 0 ? (netChange / totalAtStart) * 100 : 0;

    return {
      newEnrollments,
      canceledEnrollments,
      netChange,
      growthRate,
    };
  }

  async getMemberDemographics(
    insuranceCompanyId: string,
  ): Promise<Array<{ category: string; value: string; count: number; percentage: number }>>
  {
    // Get all members with active policies for this insurance company
    const members = await this.memberRepository.createQueryBuilder('member')
      .innerJoin('member.policies', 'policy')
      .where('policy.insuranceCompanyId = :insuranceCompanyId', { insuranceCompanyId })
      .andWhere('policy.status = :status', { status: ContractStatus.ACTIVE })
      .getMany();

    const totalMembers = members.length;
    const result: Array<{ category: string; value: string; count: number; percentage: number }> = [];

    // Age demographics
    const ageGroups = {
      '0-18': 0,
      '19-35': 0,
      '36-50': 0,
      '51-65': 0,
      '65+': 0,
    };

    // Gender demographics
    const genderGroups = {
      'Male': 0,
      'Female': 0,
      'Other': 0,
    };

    // Process members for demographics
    for (const member of members)
    {
      // Age calculation
      const birthDate = new Date(member.dateOfBirth);
      const ageDifMs = Date.now() - birthDate.getTime();
      const ageDate = new Date(ageDifMs);
      const age = Math.abs(ageDate.getUTCFullYear() - 1970);

      // Assign to age group
      if (age <= 18) ageGroups['0-18']++;
      else if (age <= 35) ageGroups['19-35']++;
      else if (age <= 50) ageGroups['36-50']++;
      else if (age <= 65) ageGroups['51-65']++;
      else ageGroups['65+']++;

      // Assign to gender group
      if (member.gender === 'Male') genderGroups['Male']++;
      else if (member.gender === 'Female') genderGroups['Female']++;
      else genderGroups['Other']++;
    }

    // Convert age groups to result format
    for (const [ageRange, count] of Object.entries(ageGroups))
    {
      result.push({
        category: 'Age',
        value: ageRange,
        count,
        percentage: totalMembers > 0 ? (count / totalMembers) * 100 : 0,
      });
    }

    // Convert gender groups to result format
    for (const [gender, count] of Object.entries(genderGroups))
    {
      result.push({
        category: 'Gender',
        value: gender,
        count,
        percentage: totalMembers > 0 ? (count / totalMembers) * 100 : 0,
      });
    }

    return result;
  }

  async getMemberRetentionRate(
    insuranceCompanyId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<number>
  {
    // Get policies that were eligible for renewal in the period
    const eligibleForRenewal = await this.policyContractRepository.count({
      where: {
        insuranceCompanyId,
        endDate: Between(startDate, endDate),
        status: In([ContractStatus.ACTIVE, ContractStatus.EXPIRED, ContractStatus.RENEWED]),
      },
    });

    // Get policies that were actually renewed
    const renewed = await this.policyContractRepository.count({
      where: {
        insuranceCompanyId,
        endDate: Between(startDate, endDate),
        status: ContractStatus.RENEWED,
      },
    });

    // Calculate retention rate
    return eligibleForRenewal > 0 ? (renewed / eligibleForRenewal) * 100 : 0;
  }

  async getPolicyDistribution(
    insuranceCompanyId: string,
  ): Promise<Array<{ policyType: string; count: number; percentage: number }>> {
    try {
      this.logger.debug(`Getting policy distribution for company ${insuranceCompanyId}`);

      // Get all active policies with their products
      const policies = await this.policyContractRepository
        .createQueryBuilder('policy')
        .innerJoinAndSelect('policy.policyProduct', 'product')
        .where('policy.insuranceCompanyId = :insuranceCompanyId', { insuranceCompanyId })
        .andWhere('policy.status = :status', { status: ContractStatus.ACTIVE })
        .getMany();

      const totalPolicies = policies.length;
      const policyTypeMap = new Map<string, number>();

      // Count policies by type
      for (const policy of policies) {
        if (!policy.policyProduct?.name) {
          this.logger.warn(`Policy ${policy.id} has no product name`);
          continue;
        }
        const type = policy.policyProduct.name;
        policyTypeMap.set(type, (policyTypeMap.get(type) || 0) + 1);
      }

      // Convert to result format
      return Array.from(policyTypeMap.entries()).map(([policyType, count]) => ({
        policyType,
        count,
        percentage: totalPolicies > 0 ? (count / totalPolicies) * 100 : 0,
      }));
    } catch (error) {
      this.logger.error(`Error getting policy distribution: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getPolicyRenewalRate(
    insuranceCompanyId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Array<{ policyType: string; eligibleCount: number; renewedCount: number; renewalRate: number }>> {
    try {
      this.logger.debug(`Getting policy renewal rate for company ${insuranceCompanyId} from ${startDate} to ${endDate}`);

      // Get all policies that were eligible for renewal in the period
      const eligiblePolicies = await this.policyContractRepository
        .createQueryBuilder('policy')
        .innerJoinAndSelect('policy.policyProduct', 'product')
        .where('policy.insuranceCompanyId = :insuranceCompanyId', { insuranceCompanyId })
        .andWhere('policy.endDate BETWEEN :startDate AND :endDate', { startDate, endDate })
        .getMany();

      // Get renewed policies in the period
      const renewedPolicies = await this.policyContractRepository
        .createQueryBuilder('policy')
        .innerJoinAndSelect('policy.policyProduct', 'product')
        .where('policy.insuranceCompanyId = :insuranceCompanyId', { insuranceCompanyId })
        .andWhere('policy.startDate BETWEEN :startDate AND :endDate', { startDate, endDate })
        .andWhere('policy.status = :status', { status: ContractStatus.ACTIVE })
        .getMany();

      const policyTypeMap = new Map<string, { eligible: number; renewed: number }>();

      // Count eligible policies by type
      for (const policy of eligiblePolicies) {
        if (!policy.policyProduct?.name) {
          this.logger.warn(`Policy ${policy.id} has no product name`);
          continue;
        }
        const type = policy.policyProduct.name;
        const current = policyTypeMap.get(type) || { eligible: 0, renewed: 0 };
        policyTypeMap.set(type, { ...current, eligible: current.eligible + 1 });
      }

      // Count renewed policies by type
      for (const policy of renewedPolicies) {
        if (!policy.policyProduct?.name) {
          this.logger.warn(`Policy ${policy.id} has no product name`);
          continue;
        }
        const type = policy.policyProduct.name;
        const current = policyTypeMap.get(type) || { eligible: 0, renewed: 0 };
        policyTypeMap.set(type, { ...current, renewed: current.renewed + 1 });
      }

      // Convert to result format
      return Array.from(policyTypeMap.entries()).map(([policyType, counts]) => ({
        policyType,
        eligibleCount: counts.eligible,
        renewedCount: counts.renewed,
        renewalRate: counts.eligible > 0 ? (counts.renewed / counts.eligible) * 100 : 0,
      }));
    } catch (error) {
      this.logger.error(`Error getting policy renewal rate: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getPolicyProfitability(
    insuranceCompanyId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Array<{ policyType: string; premiumRevenue: number; claimExpenses: number; profit: number; profitMargin: number }>> {
    try {
      this.logger.debug(`Getting policy profitability for company ${insuranceCompanyId} from ${startDate} to ${endDate}`);

      // Get all active policies with their products
      const policies = await this.policyContractRepository
        .createQueryBuilder('policy')
        .innerJoinAndSelect('policy.policyProduct', 'product')
        .where('policy.insuranceCompanyId = :insuranceCompanyId', { insuranceCompanyId })
        .andWhere('policy.status = :status', { status: ContractStatus.ACTIVE })
        .getMany();

      const policyTypeMap = new Map<string, { premiumRevenue: number; claimExpenses: number }>();

      // Calculate revenue and expenses by policy type
      for (const policy of policies) {
        if (!policy.policyProduct?.name) {
          this.logger.warn(`Policy ${policy.id} has no product name`);
          continue;
        }
        const type = policy.policyProduct.name;
        const current = policyTypeMap.get(type) || { premiumRevenue: 0, claimExpenses: 0 };

        // Add premium revenue
        current.premiumRevenue += policy.premiumAmount || 0;

        // Add claim expenses (you'll need to implement this based on your claims data structure)
        // This is a placeholder - you should replace this with actual claim expense calculation
        const claimExpenses = 0; // TODO: Implement claim expense calculation
        current.claimExpenses += claimExpenses;

        policyTypeMap.set(type, current);
      }

      // Convert to result format
      return Array.from(policyTypeMap.entries()).map(([policyType, data]) => {
        const profit = data.premiumRevenue - data.claimExpenses;
        const profitMargin = data.premiumRevenue > 0 ? (profit / data.premiumRevenue) * 100 : 0;

        return {
          policyType,
          premiumRevenue: data.premiumRevenue,
          claimExpenses: data.claimExpenses,
          profit,
          profitMargin,
        };
      });
    } catch (error) {
      this.logger.error(`Error getting policy profitability: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getActiveMembersCount(insuranceCompanyId: string): Promise<number>
  {
    return this.memberRepository.createQueryBuilder('member')
      .innerJoin('member.policies', 'policy')
      .where('policy.insuranceCompanyId = :insuranceCompanyId', { insuranceCompanyId })
      .andWhere('policy.status = :status', { status: ContractStatus.ACTIVE })
      .getCount();
  }

  async getExpiringPoliciesCount(
    insuranceCompanyId: string,
    days: number = 30,
  ): Promise<number>
  {
    const today = new Date();
    const futureDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);

    return this.policyContractRepository.count({
      where: {
        insuranceCompanyId,
        status: ContractStatus.ACTIVE,
        endDate: Between(today, futureDate),
      },
    });
  }

  private async generateContractNumber(insuranceCompanyId: string): Promise<string>
  {
    const prefix = 'PC';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const contractNumber = `${prefix}${timestamp}${random}`;

    // Ensure uniqueness
    const existing = await this.policyContractRepository.findOne({
      where: { contractNumber },
    });

    if (existing)
    {
      return this.generateContractNumber(insuranceCompanyId);
    }

    return contractNumber;
  }

  private async generatePolicyNumber(insuranceCompanyId: string): Promise<string> {
    const prefix = 'POL';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const policyNumber = `${prefix}${timestamp}${random}`;

    // Ensure uniqueness
    const existing = await this.policyContractRepository.findOne({
      where: { policyNumber },
    });

    if (existing) {
      return this.generatePolicyNumber(insuranceCompanyId);
    }

    return policyNumber;
  }

  private validateStatusTransition(
    currentStatus: ContractStatus,
    newStatus: ContractStatus,
  ): void
  {
    const allowedTransitions: Record<ContractStatus, ContractStatus[]> = {
      [ContractStatus.DRAFT]: [
        ContractStatus.PENDING,
        ContractStatus.ACTIVE,
        ContractStatus.CANCELLED,
      ],
      [ContractStatus.PENDING]: [
        ContractStatus.ACTIVE,
        ContractStatus.CANCELLED,
      ],
      [ContractStatus.ACTIVE]: [
        ContractStatus.GRACE_PERIOD,
        ContractStatus.SUSPENDED,
        ContractStatus.CANCELLED,
        ContractStatus.RENEWED,
        ContractStatus.EXPIRED,
      ],
      [ContractStatus.GRACE_PERIOD]: [
        ContractStatus.ACTIVE,
        ContractStatus.SUSPENDED,
        ContractStatus.CANCELLED,
      ],
      [ContractStatus.SUSPENDED]: [
        ContractStatus.ACTIVE,
        ContractStatus.CANCELLED,
      ],
      [ContractStatus.CANCELLED]: [],
      [ContractStatus.EXPIRED]: [ContractStatus.RENEWED],
      [ContractStatus.RENEWED]: [],
    };

    if (!allowedTransitions[currentStatus].includes(newStatus))
    {
      throw new BadRequestException(
        `Cannot transition from ${currentStatus} to ${newStatus}`,
      );
    }
  }

  async activate(
    insuranceCompanyId: string,
    id: string,
  ): Promise<PolicyContract>
  {
    const contract = await this.findOne(insuranceCompanyId, id);

    if (contract.status !== ContractStatus.DRAFT)
    {
      throw new BadRequestException('Only draft contracts can be activated');
    }

    contract.status = ContractStatus.ACTIVE;
    return this.policyContractRepository.save(contract);
  }
}

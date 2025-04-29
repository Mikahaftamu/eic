import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, ILike, In, Between, MoreThanOrEqual, LessThanOrEqual, Not, IsNull } from 'typeorm';
import { Claim, ClaimStatus, ClaimType } from './entities/claim.entity';
import { ClaimItem } from './entities/claim-item.entity';
import { ClaimAdjustment } from './entities/claim-adjustment.entity';
import { ClaimAppeal, AppealStatus } from './entities/claim-appeal.entity';
import { CreateClaimDto } from './dto/create-claim.dto';
import { MembersService } from '../members/members.service';
import { ClaimAdjudicationService } from './services/claim-adjudication.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ClaimsService {
  constructor(
    @InjectRepository(Claim)
    private claimsRepository: Repository<Claim>,
    @InjectRepository(ClaimItem)
    private claimItemsRepository: Repository<ClaimItem>,
    @InjectRepository(ClaimAdjustment)
    private claimAdjustmentsRepository: Repository<ClaimAdjustment>,
    @InjectRepository(ClaimAppeal)
    private claimAppealsRepository: Repository<ClaimAppeal>,
    private membersService: MembersService,
    private claimAdjudicationService: ClaimAdjudicationService,
  ) {}

  async create(createClaimDto: CreateClaimDto): Promise<Claim> {
    // Check if member exists and is eligible
    const eligibility = await this.membersService.isEligible(createClaimDto.memberId);
    if (!eligibility.eligible) {
      throw new BadRequestException(`Member is not eligible: ${eligibility.reason}`);
    }

    // Generate a unique claim number
    const claimNumber = this.generateClaimNumber(createClaimDto.claimType);

    // Calculate total amount from items
    const totalAmount = createClaimDto.items.reduce(
      (sum, item) => sum + item.totalPrice,
      0,
    );

    // Ensure additionalDiagnosisCodes is an array
    const additionalDiagnosisCodes = createClaimDto.additionalDiagnosisCodes
      ? (Array.isArray(createClaimDto.additionalDiagnosisCodes)
          ? createClaimDto.additionalDiagnosisCodes
          : [createClaimDto.additionalDiagnosisCodes])
      : [];

    // Create new claim
    const newClaim = this.claimsRepository.create({
      ...createClaimDto,
      claimNumber,
      totalAmount,
      approvedAmount: 0,
      paidAmount: 0,
      memberResponsibility: 0,
      status: ClaimStatus.SUBMITTED,
      additionalDiagnosisCodes,
      items: createClaimDto.items.map(item => this.claimItemsRepository.create(item)),
    });

    // Save the claim
    const savedClaim = await this.claimsRepository.save(newClaim);

    // Automatically adjudicate the claim if possible
    return this.claimAdjudicationService.adjudicateClaim(savedClaim.id);
  }

  async findAll(
    options?: {
      page?: number;
      limit?: number;
      search?: string;
      insuranceCompanyId?: string;
      memberId?: string;
      providerId?: string;
      status?: ClaimStatus;
      claimType?: ClaimType;
      startDate?: Date;
      endDate?: Date;
    },
  ): Promise<{ data: Claim[]; total: number; page: number; limit: number }> {
    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const skip = (page - 1) * limit;

    // Build where conditions
    const whereConditions: FindOptionsWhere<Claim> = {
      isDeleted: false,
    };

    if (options?.insuranceCompanyId) {
      whereConditions.insuranceCompanyId = options.insuranceCompanyId;
    }

    if (options?.memberId) {
      whereConditions.memberId = options.memberId;
    }

    if (options?.providerId) {
      whereConditions.providerId = options.providerId;
    }

    if (options?.status) {
      whereConditions.status = options.status;
    }

    if (options?.claimType) {
      whereConditions.claimType = options.claimType;
    }

    // Date range filtering
    if (options?.startDate && options?.endDate) {
      whereConditions.serviceStartDate = Between(options.startDate, options.endDate);
    } else if (options?.startDate) {
      whereConditions.serviceStartDate = MoreThanOrEqual(options.startDate);
    } else if (options?.endDate) {
      whereConditions.serviceStartDate = LessThanOrEqual(options.endDate);
    }

    // Add search condition if provided
    if (options?.search) {
      return this.search(options.search, {
        page,
        limit,
        insuranceCompanyId: options.insuranceCompanyId,
        memberId: options.memberId,
        providerId: options.providerId,
        status: options.status,
        claimType: options.claimType,
      });
    }

    const [data, total] = await this.claimsRepository.findAndCount({
      where: whereConditions,
      relations: ['items', 'adjustments'],
      skip,
      take: limit,
      order: { submissionDate: 'DESC' },
    });

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async search(
    query: string,
    options?: {
      page?: number;
      limit?: number;
      insuranceCompanyId?: string;
      memberId?: string;
      providerId?: string;
      status?: ClaimStatus;
      claimType?: ClaimType;
    },
  ): Promise<{ data: Claim[]; total: number; page: number; limit: number }> {
    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const skip = (page - 1) * limit;

    // Build where conditions for search
    const whereConditions: any = [
      { claimNumber: ILike(`%${query}%`), isDeleted: false },
      { diagnosisCode: ILike(`%${query}%`), isDeleted: false },
    ];

    // Add filters to each search condition
    whereConditions.forEach(condition => {
      if (options?.insuranceCompanyId) {
        condition.insuranceCompanyId = options.insuranceCompanyId;
      }
      
      if (options?.memberId) {
        condition.memberId = options.memberId;
      }
      
      if (options?.providerId) {
        condition.providerId = options.providerId;
      }
      
      if (options?.status) {
        condition.status = options.status;
      }
      
      if (options?.claimType) {
        condition.claimType = options.claimType;
      }
    });

    const [data, total] = await this.claimsRepository.findAndCount({
      where: whereConditions,
      relations: ['items', 'adjustments'],
      skip,
      take: limit,
      order: { submissionDate: 'DESC' },
    });

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<Claim> {
    const claim = await this.claimsRepository.findOne({
      where: { id, isDeleted: false },
      relations: ['items', 'adjustments'],
    });

    if (!claim) {
      throw new NotFoundException(`Claim with ID ${id} not found`);
    }

    return claim;
  }

  async findByClaimNumber(claimNumber: string): Promise<Claim> {
    const claim = await this.claimsRepository.findOne({
      where: { claimNumber, isDeleted: false },
      relations: ['items', 'adjustments'],
    });

    if (!claim) {
      throw new NotFoundException(`Claim with number ${claimNumber} not found`);
    }

    return claim;
  }

  async updateStatus(id: string, status: ClaimStatus, notes?: string): Promise<Claim> {
    const claim = await this.findOne(id);
    
    // Validate status transition
    this.validateStatusTransition(claim.status, status);
    
    claim.status = status;
    
    if (notes) {
      claim.notes = claim.notes 
        ? `${claim.notes}\n${new Date().toISOString()}: ${notes}` 
        : `${new Date().toISOString()}: ${notes}`;
    }
    
    return this.claimsRepository.save(claim);
  }

  async softDelete(id: string): Promise<void> {
    const claim = await this.findOne(id);
    claim.isDeleted = true;
    await this.claimsRepository.save(claim);
  }

  async createAppeal(
    claimId: string, 
    submittedById: string,
    reason: string,
    appealedAmount: number,
    supportingInformation?: string,
    documentReferences?: string[],
  ): Promise<ClaimAppeal> {
    const claim = await this.findOne(claimId);
    
    // Check if claim can be appealed
    if (![ClaimStatus.DENIED, ClaimStatus.PARTIALLY_APPROVED].includes(claim.status)) {
      throw new BadRequestException('Only denied or partially approved claims can be appealed');
    }
    
    // Generate appeal number
    const appealNumber = `AP-${claim.claimNumber}-${uuidv4().substring(0, 8)}`;
    
    // Create appeal
    const appeal = this.claimAppealsRepository.create({
      claimId,
      submittedById,
      appealNumber,
      reason,
      supportingInformation,
      documentReferences,
      submissionDate: new Date(),
      status: AppealStatus.SUBMITTED,
      originalAmount: claim.totalAmount,
      appealedAmount,
      appealLevel: 1,
    });
    
    // Update claim status
    await this.updateStatus(claimId, ClaimStatus.APPEALED, `Appeal submitted: ${appealNumber}`);
    
    return this.claimAppealsRepository.save(appeal);
  }

  async getAppealsForClaim(claimId: string): Promise<ClaimAppeal[]> {
    return this.claimAppealsRepository.find({
      where: { claimId },
      order: { submissionDate: 'DESC' },
    });
  }

  async getClaimsByStatus(
    insuranceCompanyId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Array<{ status: string; count: number; amount: number }>> {
    const statusCounts: Array<{ status: string; count: number; amount: number }> = [];
    
    // Get all possible statuses
    const statuses = Object.values(ClaimStatus);
    
    // For each status, get count and total amount
    for (const status of statuses) {
      const claims = await this.claimsRepository.find({
        where: {
          insuranceCompanyId,
          status,
          createdAt: Between(startDate, endDate),
        },
      });
      
      const count = claims.length;
      const amount = claims.reduce((sum, claim) => sum + claim.totalAmount, 0);
      
      statusCounts.push({
        status,
        count,
        amount,
      });
    }
    
    return statusCounts;
  }

  async getAverageProcessingTime(
    insuranceCompanyId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    const completedClaims = await this.claimsRepository.find({
      where: {
        insuranceCompanyId,
        status: In([ClaimStatus.APPROVED, ClaimStatus.DENIED, ClaimStatus.PARTIALLY_APPROVED]),
        createdAt: Between(startDate, endDate),
        updatedAt: Not(IsNull()),
      },
    });
    
    if (completedClaims.length === 0) {
      return 0;
    }
    
    // Calculate average processing time in days
    const totalDays = completedClaims.reduce((sum, claim) => {
      const createdDate = new Date(claim.createdAt);
      const updatedDate = new Date(claim.updatedAt);
      const diffTime = Math.abs(updatedDate.getTime() - createdDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return sum + diffDays;
    }, 0);
    
    return totalDays / completedClaims.length;
  }

  async getClaimsByProvider(
    insuranceCompanyId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<any[]> {
    // Get claims grouped by provider
    const claims = await this.claimsRepository.find({
      where: {
        insuranceCompanyId,
        createdAt: Between(startDate, endDate),
      },
      relations: ['provider'],
    });
    
    // Group claims by provider
    const providerMap = new Map();
    
    for (const claim of claims) {
      if (!claim.provider) continue;
      
      const providerId = claim.providerId;
      const providerName = claim.provider.name;
      
      if (!providerMap.has(providerId)) {
        providerMap.set(providerId, {
          providerId,
          providerName,
          count: 0,
          amount: 0,
        });
      }
      
      const providerData = providerMap.get(providerId);
      providerData.count += 1;
      providerData.amount += claim.totalAmount;
    }
    
    return Array.from(providerMap.values());
  }

  async getTopClaimCategories(
    insuranceCompanyId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<any[]> {
    // Get claim items grouped by category
    const claims = await this.claimsRepository.find({
      where: {
        insuranceCompanyId,
        createdAt: Between(startDate, endDate),
      },
      relations: ['items'],
    });
    
    // Group claim items by category
    const categoryMap = new Map();
    
    for (const claim of claims) {
      for (const item of claim.items) {
        const category = item.serviceCode;
        
        if (!categoryMap.has(category)) {
          categoryMap.set(category, {
            category,
            count: 0,
            amount: 0,
          });
        }
        
        const categoryData = categoryMap.get(category);
        categoryData.count += 1;
        categoryData.amount += item.totalPrice;
      }
    }
    
    // Sort by amount and return top 10
    return Array.from(categoryMap.values())
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10);
  }

  async getTopProvidersByClaims(
    insuranceCompanyId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<any[]> {
    const providerData = await this.getClaimsByProvider(
      insuranceCompanyId,
      startDate,
      endDate,
    );
    
    // Sort by amount and return top 10
    return providerData
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10);
  }

  async getPendingClaimsCount(insuranceCompanyId: string): Promise<number> {
    return this.claimsRepository.count({
      where: {
        insuranceCompanyId,
        status: ClaimStatus.PENDING,
      },
    });
  }

  private generateClaimNumber(claimType: ClaimType): string {
    const prefix = this.getClaimTypePrefix(claimType);
    const timestamp = new Date().getTime().toString().slice(-10);
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefix}${timestamp}${random}`;
  }

  private getClaimTypePrefix(claimType: ClaimType): string {
    switch (claimType) {
      case ClaimType.MEDICAL:
        return 'MED';
      case ClaimType.DENTAL:
        return 'DEN';
      case ClaimType.VISION:
        return 'VIS';
      case ClaimType.PHARMACY:
        return 'RX';
      case ClaimType.MENTAL_HEALTH:
        return 'MH';
      default:
        return 'CLM';
    }
  }

  private validateStatusTransition(currentStatus: ClaimStatus, newStatus: ClaimStatus): void {
    // Define valid status transitions
    const validTransitions: Record<ClaimStatus, ClaimStatus[]> = {
      [ClaimStatus.SUBMITTED]: [ClaimStatus.PENDING, ClaimStatus.IN_REVIEW, ClaimStatus.DENIED],
      [ClaimStatus.PENDING]: [ClaimStatus.IN_REVIEW, ClaimStatus.APPROVED, ClaimStatus.PARTIALLY_APPROVED, ClaimStatus.DENIED],
      [ClaimStatus.IN_REVIEW]: [ClaimStatus.APPROVED, ClaimStatus.PARTIALLY_APPROVED, ClaimStatus.DENIED],
      [ClaimStatus.APPROVED]: [ClaimStatus.PAID, ClaimStatus.VOID],
      [ClaimStatus.PARTIALLY_APPROVED]: [ClaimStatus.PAID, ClaimStatus.APPEALED, ClaimStatus.VOID],
      [ClaimStatus.DENIED]: [ClaimStatus.APPEALED, ClaimStatus.VOID],
      [ClaimStatus.APPEALED]: [ClaimStatus.IN_REVIEW, ClaimStatus.APPROVED, ClaimStatus.PARTIALLY_APPROVED, ClaimStatus.DENIED],
      [ClaimStatus.PAID]: [ClaimStatus.VOID],
      [ClaimStatus.VOID]: [],
    };

    if (!validTransitions[currentStatus].includes(newStatus)) {
      throw new BadRequestException(
        `Invalid status transition from ${currentStatus} to ${newStatus}. Valid transitions are: ${validTransitions[currentStatus].join(', ')}`,
      );
    }
  }
}

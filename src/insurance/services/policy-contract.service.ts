import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThan, MoreThan, In } from 'typeorm';
import { PolicyContract, PolicyStatus } from '../entities/policy-contract.entity';
import { Member } from '../../members/entities/member.entity';
import { addDays } from 'date-fns';

@Injectable()
export class PolicyContractService {
  constructor(
    @InjectRepository(PolicyContract)
    private policyContractRepository: Repository<PolicyContract>,
    @InjectRepository(Member)
    private memberRepository: Repository<Member>,
  ) {}

  // Analytics methods for member statistics
  async getMemberEnrollmentStats(
    insuranceCompanyId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<{
    newEnrollments: number;
    canceledEnrollments: number;
    netChange: number;
    growthRate: number;
  }> {
    // Get new enrollments in the period
    const newEnrollments = await this.policyContractRepository.count({
      where: {
        insuranceCompanyId,
        startDate: Between(startDate, endDate),
        status: PolicyStatus.ACTIVE,
      },
    });

    // Get canceled enrollments in the period
    const canceledEnrollments = await this.policyContractRepository.count({
      where: {
        insuranceCompanyId,
        endDate: Between(startDate, endDate),
        status: PolicyStatus.CANCELED,
      },
    });

    // Calculate net change
    const netChange = newEnrollments - canceledEnrollments;

    // Get total active policies at the start of the period
    const totalAtStart = await this.policyContractRepository.count({
      where: {
        insuranceCompanyId,
        startDate: LessThan(startDate),
        status: PolicyStatus.ACTIVE,
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
  ): Promise<Array<{ category: string; value: string; count: number; percentage: number }>> {
    // Get all members with active policies for this insurance company
    const members = await this.memberRepository.createQueryBuilder('member')
      .innerJoin('member.policies', 'policy')
      .where('policy.insuranceCompanyId = :insuranceCompanyId', { insuranceCompanyId })
      .andWhere('policy.status = :status', { status: PolicyStatus.ACTIVE })
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
    for (const member of members) {
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
    for (const [ageRange, count] of Object.entries(ageGroups)) {
      result.push({
        category: 'Age',
        value: ageRange,
        count,
        percentage: totalMembers > 0 ? (count / totalMembers) * 100 : 0,
      });
    }

    // Convert gender groups to result format
    for (const [gender, count] of Object.entries(genderGroups)) {
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
  ): Promise<number> {
    // Get policies that were eligible for renewal in the period
    const eligibleForRenewal = await this.policyContractRepository.count({
      where: {
        insuranceCompanyId,
        endDate: Between(startDate, endDate),
        status: In([PolicyStatus.ACTIVE, PolicyStatus.EXPIRED, PolicyStatus.RENEWED]),
      },
    });

    // Get policies that were actually renewed
    const renewed = await this.policyContractRepository.count({
      where: {
        insuranceCompanyId,
        endDate: Between(startDate, endDate),
        status: PolicyStatus.RENEWED,
      },
    });

    // Calculate retention rate
    return eligibleForRenewal > 0 ? (renewed / eligibleForRenewal) * 100 : 0;
  }

  // Analytics methods for policy statistics
  async getPolicyDistribution(
    insuranceCompanyId: string,
  ): Promise<Array<{ policyType: string; count: number; percentage: number }>> {
    // Get all active policies
    const policies = await this.policyContractRepository.find({
      where: {
        insuranceCompanyId,
        status: PolicyStatus.ACTIVE,
      },
    });

    const totalPolicies = policies.length;
    const policyTypeMap = new Map<string, number>();

    // Count policies by type
    for (const policy of policies) {
      const type = policy.policyType;
      policyTypeMap.set(type, (policyTypeMap.get(type) || 0) + 1);
    }

    // Convert to result format
    return Array.from(policyTypeMap.entries()).map(([policyType, count]) => ({
      policyType,
      count,
      percentage: totalPolicies > 0 ? (count / totalPolicies) * 100 : 0,
    }));
  }

  async getPolicyRenewalRate(
    insuranceCompanyId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Array<{ policyType: string; eligibleCount: number; renewedCount: number; renewalRate: number }>> {
    // Get all policy types
    const policies = await this.policyContractRepository.find({
      where: {
        insuranceCompanyId,
      },
      select: ['policyType'],
    });

    const policyTypes = [...new Set(policies.map(p => p.policyType))];
    const result: Array<{ policyType: string; eligibleCount: number; renewedCount: number; renewalRate: number }> = [];

    for (const policyType of policyTypes) {
      // Get policies eligible for renewal
      const eligibleCount = await this.policyContractRepository.count({
        where: {
          insuranceCompanyId,
          policyType,
          endDate: Between(startDate, endDate),
        },
      });

      // Get renewed policies
      const renewedCount = await this.policyContractRepository.count({
        where: {
          insuranceCompanyId,
          policyType,
          endDate: Between(startDate, endDate),
          status: PolicyStatus.RENEWED,
        },
      });

      // Calculate renewal rate
      const renewalRate = eligibleCount > 0 ? (renewedCount / eligibleCount) * 100 : 0;

      result.push({
        policyType,
        eligibleCount,
        renewedCount,
        renewalRate,
      });
    }

    return result;
  }

  async getPolicyProfitability(
    insuranceCompanyId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Array<{ policyType: string; premiumRevenue: number; claimExpenses: number; profit: number; profitMargin: number }>> {
    // This would typically join with claims and payment data
    // For now, we'll return mock data
    return [
      {
        policyType: 'Health Insurance',
        premiumRevenue: 250000,
        claimExpenses: 175000,
        profit: 75000,
        profitMargin: 30,
      },
      {
        policyType: 'Dental Insurance',
        premiumRevenue: 120000,
        claimExpenses: 80000,
        profit: 40000,
        profitMargin: 33.3,
      },
      {
        policyType: 'Vision Insurance',
        premiumRevenue: 80000,
        claimExpenses: 45000,
        profit: 35000,
        profitMargin: 43.75,
      },
    ];
  }

  // Dashboard analytics methods
  async getActiveMembersCount(insuranceCompanyId: string): Promise<number> {
    return this.memberRepository.createQueryBuilder('member')
      .innerJoin('member.policies', 'policy')
      .where('policy.insuranceCompanyId = :insuranceCompanyId', { insuranceCompanyId })
      .andWhere('policy.status = :status', { status: PolicyStatus.ACTIVE })
      .getCount();
  }

  async getExpiringPoliciesCount(
    insuranceCompanyId: string,
    days: number = 30,
  ): Promise<number> {
    const today = new Date();
    const futureDate = addDays(today, days);

    return this.policyContractRepository.count({
      where: {
        insuranceCompanyId,
        status: PolicyStatus.ACTIVE,
        endDate: Between(today, futureDate),
      },
    });
  }
}

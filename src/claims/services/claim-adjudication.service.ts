import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Claim, ClaimStatus } from '../entities/claim.entity';
import { ClaimItem, ClaimItemStatus } from '../entities/claim-item.entity';
import { ClaimAdjustment, AdjustmentType } from '../entities/claim-adjustment.entity';
import { MembersService } from '../../members/members.service';

interface BenefitsCoverage {
  deductible: {
    individual: number;
    family: number;
    remainingIndividual: number;
    remainingFamily: number;
  };
  coinsurance: {
    inNetwork: number;
    outOfNetwork: number;
  };
  copay: {
    primaryCare: number;
    specialist: number;
    emergencyRoom: number;
    urgentCare: number;
  };
  outOfPocketMax: {
    individual: number;
    family: number;
    remainingIndividual: number;
    remainingFamily: number;
  };
  preventiveCare: boolean;
  excludedServices: string[];
}

// Define an interface for adjustment data
interface AdjustmentData {
  claimId: string;
  claimItemId: string;
  adjustmentType: AdjustmentType;
  amount: number;
  reason: string;
  adjustmentDate: Date;
}

@Injectable()
export class ClaimAdjudicationService {
  constructor(
    @InjectRepository(Claim)
    private claimsRepository: Repository<Claim>,
    @InjectRepository(ClaimItem)
    private claimItemsRepository: Repository<ClaimItem>,
    @InjectRepository(ClaimAdjustment)
    private claimAdjustmentsRepository: Repository<ClaimAdjustment>,
    private membersService: MembersService,
  ) {}

  async adjudicateClaim(claimId: string): Promise<Claim> {
    const claim = await this.claimsRepository.findOne({
      where: { id: claimId },
      relations: ['items'],
    });

    if (!claim) {
      throw new NotFoundException(`Claim with ID ${claimId} not found`);
    }

    // Check if claim is in a state that can be adjudicated
    if (![ClaimStatus.SUBMITTED, ClaimStatus.PENDING, ClaimStatus.IN_REVIEW, ClaimStatus.APPEALED].includes(claim.status)) {
      throw new BadRequestException(`Claim with status ${claim.status} cannot be adjudicated`);
    }

    // Get member and their benefits
    const member = await this.membersService.findOne(claim.memberId);
    if (!member.benefits) {
      throw new BadRequestException('Member has no benefits information');
    }

    // Extract benefits coverage from member
    const benefitsCoverage = this.extractBenefitsCoverage(member.benefits);

    // Process each claim item
    let totalApproved = 0;
    let totalMemberResponsibility = 0;
    const adjustments: AdjustmentData[] = [];

    for (const item of claim.items) {
      // Check if service is excluded
      if (this.isExcludedService(item.serviceCode, benefitsCoverage.excludedServices)) {
        item.status = ClaimItemStatus.DENIED;
        item.denialReason = 'Service is excluded from coverage';
        item.approvedAmount = 0;
        item.memberResponsibility = item.totalPrice;
        
        adjustments.push({
          claimId: claim.id,
          claimItemId: item.id,
          adjustmentType: AdjustmentType.NON_COVERED,
          amount: item.totalPrice,
          reason: 'Service excluded from coverage',
          adjustmentDate: new Date(),
        });
        
        continue;
      }

      // Check if service is preventive care
      if (item.isPreventiveCare && benefitsCoverage.preventiveCare) {
        item.status = ClaimItemStatus.APPROVED;
        item.approvedAmount = item.totalPrice;
        item.paidAmount = item.totalPrice;
        item.memberResponsibility = 0;
        totalApproved += item.totalPrice;
        continue;
      }

      // Apply deductible if applicable
      let remainingAmount = item.totalPrice;
      let deductibleApplied = 0;

      if (benefitsCoverage.deductible.remainingIndividual > 0) {
        deductibleApplied = Math.min(remainingAmount, benefitsCoverage.deductible.remainingIndividual);
        remainingAmount -= deductibleApplied;
        benefitsCoverage.deductible.remainingIndividual -= deductibleApplied;
        
        if (deductibleApplied > 0) {
          adjustments.push({
            claimId: claim.id,
            claimItemId: item.id,
            adjustmentType: AdjustmentType.DEDUCTIBLE,
            amount: deductibleApplied,
            reason: 'Annual deductible applied',
            adjustmentDate: new Date(),
          });
        }
      }

      // Apply copay if applicable
      let copayApplied = 0;
      if (this.shouldApplyCopay(item.serviceCode)) {
        copayApplied = this.determineCopayAmount(item.serviceCode, benefitsCoverage.copay);
        remainingAmount = Math.max(0, remainingAmount - copayApplied);
        
        if (copayApplied > 0) {
          adjustments.push({
            claimId: claim.id,
            claimItemId: item.id,
            adjustmentType: AdjustmentType.COPAY,
            amount: copayApplied,
            reason: 'Copay applied',
            adjustmentDate: new Date(),
          });
        }
      }

      // Apply coinsurance if applicable
      let coinsuranceApplied = 0;
      if (remainingAmount > 0) {
        const coinsuranceRate = claim.isOutOfNetwork 
          ? benefitsCoverage.coinsurance.outOfNetwork 
          : benefitsCoverage.coinsurance.inNetwork;
        
        coinsuranceApplied = remainingAmount * (coinsuranceRate / 100);
        remainingAmount -= coinsuranceApplied;
        
        if (coinsuranceApplied > 0) {
          adjustments.push({
            claimId: claim.id,
            claimItemId: item.id,
            adjustmentType: AdjustmentType.COINSURANCE,
            amount: coinsuranceApplied,
            reason: `${coinsuranceRate}% coinsurance applied`,
            adjustmentDate: new Date(),
          });
        }
      }

      // Calculate member responsibility and approved amount
      const memberResponsibility = deductibleApplied + copayApplied + coinsuranceApplied;
      const approvedAmount = item.totalPrice - memberResponsibility;

      // Update claim item
      item.status = ClaimItemStatus.APPROVED;
      item.approvedAmount = approvedAmount;
      item.paidAmount = approvedAmount;
      item.memberResponsibility = memberResponsibility;

      // Update totals
      totalApproved += approvedAmount;
      totalMemberResponsibility += memberResponsibility;
    }

    // Save all claim items
    await this.claimItemsRepository.save(claim.items);

    // Save all adjustments
    if (adjustments.length > 0) {
      // Create and save each adjustment individually to avoid TypeScript errors
      for (const adjustmentData of adjustments) {
        const adjustment = this.claimAdjustmentsRepository.create(adjustmentData);
        await this.claimAdjustmentsRepository.save(adjustment);
      }
    }

    // Update claim status and amounts
    claim.approvedAmount = totalApproved;
    claim.paidAmount = totalApproved;
    claim.memberResponsibility = totalMemberResponsibility;
    
    // Determine final claim status
    if (totalApproved === 0) {
      claim.status = ClaimStatus.DENIED;
      claim.denialReason = 'No services approved for coverage';
    } else if (totalApproved < claim.totalAmount) {
      claim.status = ClaimStatus.PARTIALLY_APPROVED;
    } else {
      claim.status = ClaimStatus.APPROVED;
    }

    // Save and return the updated claim
    return this.claimsRepository.save(claim);
  }

  private extractBenefitsCoverage(benefits: any): BenefitsCoverage {
    // In a real implementation, this would map the member's benefits to the structure needed for adjudication
    // For now, we'll create a simplified version
    return {
      deductible: {
        individual: benefits.deductible?.individual || 0,
        family: benefits.deductible?.family || 0,
        remainingIndividual: benefits.deductible?.remainingIndividual || 0,
        remainingFamily: benefits.deductible?.remainingFamily || 0,
      },
      coinsurance: {
        inNetwork: benefits.coinsurance?.inNetwork || 20,
        outOfNetwork: benefits.coinsurance?.outOfNetwork || 40,
      },
      copay: {
        primaryCare: benefits.copay?.primaryCare || 25,
        specialist: benefits.copay?.specialist || 50,
        emergencyRoom: benefits.copay?.emergencyRoom || 250,
        urgentCare: benefits.copay?.urgentCare || 75,
      },
      outOfPocketMax: {
        individual: benefits.outOfPocketMax?.individual || 6000,
        family: benefits.outOfPocketMax?.family || 12000,
        remainingIndividual: benefits.outOfPocketMax?.remainingIndividual || 6000,
        remainingFamily: benefits.outOfPocketMax?.remainingFamily || 12000,
      },
      preventiveCare: benefits.preventiveCare !== false,
      excludedServices: benefits.excludedServices || [],
    };
  }

  private isExcludedService(serviceCode: string, excludedServices: string[]): boolean {
    return excludedServices.includes(serviceCode);
  }

  private shouldApplyCopay(serviceCode: string): boolean {
    // In a real implementation, this would check the service code against a list of services that require copays
    // For simplicity, we'll assume all office visit codes (99xxx) require copays
    return serviceCode.startsWith('99');
  }

  private determineCopayAmount(serviceCode: string, copays: any): number {
    // In a real implementation, this would determine the appropriate copay based on the service code
    // For simplicity, we'll use a basic mapping
    if (serviceCode.startsWith('99201') || serviceCode.startsWith('99211')) {
      return copays.primaryCare;
    } else if (serviceCode.startsWith('992')) {
      return copays.specialist;
    } else if (serviceCode.startsWith('99281')) {
      return copays.emergencyRoom;
    } else if (serviceCode.startsWith('99201')) {
      return copays.urgentCare;
    }
    return 0;
  }
}

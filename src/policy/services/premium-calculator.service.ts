import { Injectable } from '@nestjs/common';
import { PolicyProduct } from '../entities/policy-product.entity';
import { Member } from '../../members/entities/member.entity';

interface PremiumFactors {
  basePremium: number;
  ageFactor: number;
  familySizeFactor: number;
  coverageTypeFactor: number;
  loadingFactor: number;
  discountFactor: number;
}

interface AgeGroup {
  minAge: number;
  maxAge: number;
  factor: number;
}

@Injectable()
export class PremiumCalculatorService {
  private readonly coverageTypeFactors: Record<string, number> = {
    BASIC: 1.0,
    STANDARD: 1.2,
    PREMIUM: 1.5,
    EXECUTIVE: 2.0,
  };

  calculatePremium(
    policyProduct: PolicyProduct,
    primaryMember: Member,
    dependentMembers: Member[] = [],
    specialTerms?: {
      loadings: Array<{ percentage: number }>;
      discounts: Array<{ percentage: number }>;
    },
  ): {
    totalPremium: number;
    factors: PremiumFactors;
    breakdown: {
      memberPremiums: Array<{ memberId: string; premium: number }>;
      loadings: Array<{ amount: number; percentage: number }>;
      discounts: Array<{ amount: number; percentage: number }>;
    };
  } {
    const allMembers = [primaryMember, ...dependentMembers];
    const familySize = allMembers.length;

    // Get premium modifiers from policy product
    const premiumModifiers = policyProduct.premiumModifiers || {
      ageFactors: [],
      familySizeFactors: [],
      loadingFactors: [],
      discountFactors: [],
    };

    // Calculate base premium with family size factor
    const familySizeFactor = this.getFamilySizeFactor(familySize, premiumModifiers.familySizeFactors);
    const basePremium = policyProduct.basePremium || 0;

    // Calculate average age factor
    const ageFactor = this.calculateAverageAgeFactor(allMembers, premiumModifiers.ageFactors);

    // Get coverage type factor
    const coverageTypeFactor = this.coverageTypeFactors[policyProduct.coverageType] || 1.0;

    // Calculate member premiums
    const memberPremiums = allMembers.map(member => ({
      memberId: member.id,
      premium: this.calculateMemberPremium(
        basePremium,
        this.getAgeFactor(this.calculateAge(member.dateOfBirth), premiumModifiers.ageFactors),
        coverageTypeFactor,
      ),
    }));

    // Calculate loadings
    const loadingFactor = this.calculateLoadingFactor(specialTerms?.loadings || []);
    const loadings = specialTerms?.loadings?.map(loading => ({
      percentage: loading.percentage,
      amount: (basePremium * familySizeFactor * loading.percentage) / 100,
    })) || [];

    // Calculate discounts
    const discountFactor = this.calculateDiscountFactor(specialTerms?.discounts || []);
    const discounts = specialTerms?.discounts?.map(discount => ({
      percentage: discount.percentage,
      amount: (basePremium * familySizeFactor * discount.percentage) / 100,
    })) || [];

    // Calculate total premium
    const subtotal = memberPremiums.reduce((sum, { premium }) => sum + premium, 0);
    const totalPremium = subtotal * (1 + loadingFactor - discountFactor);

    return {
      totalPremium,
      factors: {
        basePremium,
        ageFactor,
        familySizeFactor,
        coverageTypeFactor,
        loadingFactor,
        discountFactor,
      },
      breakdown: {
        memberPremiums,
        loadings,
        discounts,
      },
    };
  }

  private calculateAge(dateOfBirth: Date): number {
    const today = new Date();
    let age = today.getFullYear() - dateOfBirth.getFullYear();
    const monthDiff = today.getMonth() - dateOfBirth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
      age--;
    }
    
    return age;
  }

  private getAgeFactor(age: number, ageFactors: Array<{ minAge: number; maxAge: number; factor: number }> = []): number {
    // Use provided age factors or default to 1.0
    if (!ageFactors || ageFactors.length === 0) {
      return 1.0;
    }
    
    const ageGroup = ageFactors.find(
      group => age >= group.minAge && age <= group.maxAge,
    );
    return ageGroup?.factor || 1.0;
  }

  private calculateAverageAgeFactor(
    members: Member[], 
    ageFactors: Array<{ minAge: number; maxAge: number; factor: number }> = []
  ): number {
    const totalAgeFactor = members.reduce(
      (sum, member) => sum + this.getAgeFactor(this.calculateAge(member.dateOfBirth), ageFactors),
      0,
    );
    return totalAgeFactor / members.length;
  }

  private getFamilySizeFactor(
    size: number, 
    familySizeFactors: Array<{ size: number; factor: number }> = []
  ): number {
    // Use provided family size factors or default to 1.0
    if (!familySizeFactors || familySizeFactors.length === 0) {
      return 1.0;
    }
    
    const factor = familySizeFactors.find(f => f.size === size);
    if (factor) {
      return factor.factor;
    }
    
    // If size is larger than any defined factor, use the largest one
    const sortedFactors = [...familySizeFactors].sort((a, b) => b.size - a.size);
    return sortedFactors.length > 0 ? sortedFactors[0].factor : 1.0;
  }

  private calculateMemberPremium(
    basePremium: number,
    ageFactor: number,
    coverageTypeFactor: number,
  ): number {
    return basePremium * ageFactor * coverageTypeFactor;
  }

  private calculateLoadingFactor(loadings: Array<{ percentage: number }>): number {
    return loadings.reduce((total, loading) => total + loading.percentage / 100, 0);
  }

  private calculateDiscountFactor(discounts: Array<{ percentage: number }>): number {
    return discounts.reduce((total, discount) => total + discount.percentage / 100, 0);
  }
}

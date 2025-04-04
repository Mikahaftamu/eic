import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FraudRule, RuleType } from '../entities/fraud-rule.entity';
import { ClaimFraudAlert, AlertStatus } from '../entities/claim-fraud-alert.entity';
import { MedicalCatalogService } from '../../medical-catalog/services/medical-catalog.service';
import { ClaimsService } from '../../claims/claims.service';

interface RuleViolationResult {
  isViolated: boolean;
  explanation: string;
  confidenceScore: number;
  additionalData: Record<string, any>;
}

interface CodeViolation {
  code1: string;
  code2: string;
}

interface UpcodingViolation {
  lowerCode: string;
  higherCode: string;
  providerRatio: number;
  threshold: number;
  specialty: string;
}

@Injectable()
export class RuleBasedDetectionService {
  constructor(
    @InjectRepository(FraudRule)
    private fraudRuleRepository: Repository<FraudRule>,
    @InjectRepository(ClaimFraudAlert)
    private claimFraudAlertRepository: Repository<ClaimFraudAlert>,
    private medicalCatalogService: MedicalCatalogService,
    private claimsService: ClaimsService,
  ) {}

  async analyzeClaimForFraud(claimId: string, insuranceCompanyId: string): Promise<ClaimFraudAlert[]> {
    // Get claim details
    const claim = await this.claimsService.findOne(claimId);
    if (!claim) {
      throw new Error(`Claim with ID ${claimId} not found`);
    }

    // Get applicable rules
    const rules = await this.getApplicableRules(insuranceCompanyId);
    const alerts: ClaimFraudAlert[] = [];

    // Apply each rule
    for (const rule of rules) {
      const alert = await this.applyRule(rule, claim);
      if (alert) {
        alerts.push(await this.claimFraudAlertRepository.save(alert));
      }
    }

    return alerts;
  }

  private async getApplicableRules(insuranceCompanyId: string): Promise<FraudRule[]> {
    return this.fraudRuleRepository.find({
      where: [
        { insuranceCompanyId: insuranceCompanyId },
        { isSystemWide: true }
      ],
      order: { severity: 'DESC' }
    });
  }

  private async applyRule(rule: FraudRule, claim: any): Promise<ClaimFraudAlert | null> {
    let result: RuleViolationResult;

    switch (rule.type) {
      case RuleType.FREQUENCY:
        result = await this.checkFrequencyRule(rule, claim);
        break;
      
      case RuleType.COMPATIBILITY:
        result = await this.checkCompatibilityRule(rule, claim);
        break;
      
      case RuleType.UPCODING:
        result = await this.checkUpcodingRule(rule, claim);
        break;

      default:
        // Default case for other rule types
        result = {
          isViolated: false,
          explanation: '',
          confidenceScore: 0,
          additionalData: {}
        };
    }

    if (result.isViolated) {
      return this.createAlert(rule, claim, result.explanation, result.confidenceScore, result.additionalData);
    }

    return null;
  }

  private async checkFrequencyRule(rule: FraudRule, claim: any): Promise<RuleViolationResult> {
    const config = rule.configuration;
    const timeframeDays = config.timeframeDays || 30;
    const maxOccurrences = config.maxOccurrences || 1;
    const procedureCodes = config.procedureCodes || [];
    
    // Get historical claims for this member
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - timeframeDays);
    
    const memberClaims = await this.claimsService.findAll({
      memberId: claim.memberId,
      startDate: startDate,
      limit: 100 // Get a reasonable number of claims
    });
    
    // Count occurrences of specified procedures
    let occurrences = 0;
    const matchingClaims: string[] = [];
    
    for (const historicalClaim of memberClaims.data) {
      // Skip the current claim
      if (historicalClaim.id === claim.id) continue;
      
      // Check if this claim contains any of the specified procedures
      const hasMatchingProcedure = historicalClaim.items.some(
        (item: any) => procedureCodes.includes(item.serviceCode)
      );
      
      if (hasMatchingProcedure) {
        occurrences++;
        matchingClaims.push(historicalClaim.id);
      }
    }
    
    // Check if the current claim also has matching procedures
    const currentClaimHasMatchingProcedure = claim.items.some(
      (item: any) => procedureCodes.includes(item.serviceCode)
    );
    
    if (currentClaimHasMatchingProcedure) {
      occurrences++;
    }
    
    const isViolated = occurrences > maxOccurrences;
    const confidenceScore = isViolated ? Math.min(100, (occurrences / maxOccurrences) * 70) : 0;
    
    return {
      isViolated,
      explanation: isViolated 
        ? `Found ${occurrences} occurrences of procedures ${procedureCodes.join(', ')} within ${timeframeDays} days, exceeding maximum of ${maxOccurrences}`
        : '',
      confidenceScore,
      additionalData: {
        occurrences,
        timeframeDays,
        maxOccurrences,
        procedureCodes,
        matchingClaims
      }
    };
  }

  private async checkCompatibilityRule(rule: FraudRule, claim: any): Promise<RuleViolationResult> {
    const config = rule.configuration;
    const incompatibleCodes = config.incompatibleCodes || [];
    
    // Extract all service codes from the claim
    const claimServiceCodes = claim.items.map((item: any) => item.serviceCode);
    
    // Check for incompatible code pairs
    const violations: CodeViolation[] = [];
    
    for (const pair of incompatibleCodes) {
      const [code1, code2] = pair;
      if (claimServiceCodes.includes(code1) && claimServiceCodes.includes(code2)) {
        violations.push({ code1, code2 });
      }
    }
    
    const isViolated = violations.length > 0;
    const confidenceScore = isViolated ? 90 : 0; // High confidence for compatibility issues
    
    return {
      isViolated,
      explanation: isViolated 
        ? `Claim contains incompatible procedure codes: ${violations.map(v => `${v.code1} and ${v.code2}`).join(', ')}`
        : '',
      confidenceScore,
      additionalData: {
        violations,
        claimServiceCodes
      }
    };
  }

  private async checkUpcodingRule(rule: FraudRule, claim: any): Promise<RuleViolationResult> {
    const config = rule.configuration;
    const upcodingPatterns = config.upcodingPatterns || [];
    const providerSpecialty = claim.provider?.specialty;
    
    // Check for suspicious upcoding patterns
    const violations: UpcodingViolation[] = [];
    
    for (const pattern of upcodingPatterns) {
      const { lowerCode, higherCode, specialties, threshold } = pattern;
      
      // Skip if this pattern doesn't apply to this provider's specialty
      if (specialties && specialties.length > 0 && !specialties.includes(providerSpecialty)) {
        continue;
      }
      
      // Check if the claim has the higher-paying code instead of the lower one
      const hasHigherCode = claim.items.some((item: any) => item.serviceCode === higherCode);
      
      if (hasHigherCode) {
        // Get provider's historical usage ratio
        const providerStats = await this.getProviderCodeUsageStats(
          claim.providerId, 
          lowerCode, 
          higherCode
        );
        
        // If the provider uses the higher code more often than the threshold, flag it
        if (providerStats.ratio > threshold) {
          violations.push({
            lowerCode,
            higherCode,
            providerRatio: providerStats.ratio,
            threshold,
            specialty: providerSpecialty
          });
        }
      }
    }
    
    const isViolated = violations.length > 0;
    const confidenceScore = isViolated 
      ? Math.min(100, violations.reduce((max, v) => Math.max(max, (v.providerRatio / v.threshold) * 80), 0))
      : 0;
    
    return {
      isViolated,
      explanation: isViolated 
        ? `Potential upcoding detected: provider uses higher-paying codes at suspicious rates`
        : '',
      confidenceScore,
      additionalData: {
        violations,
        providerSpecialty
      }
    };
  }

  private async getProviderCodeUsageStats(providerId: string, lowerCode: string, higherCode: string): Promise<any> {
    // This would typically query the database for historical claims
    // For now, we'll return a mock implementation
    return {
      lowerCodeCount: 20,
      higherCodeCount: 80,
      ratio: 0.8, // 80% higher code usage
      averageRatio: 0.3 // Average for specialty is 30%
    };
  }

  private createAlert(
    rule: FraudRule, 
    claim: any, 
    explanation: string, 
    confidenceScore: number, 
    additionalData: Record<string, any>
  ): ClaimFraudAlert {
    const alert = new ClaimFraudAlert();
    alert.claimId = claim.id;
    alert.ruleId = rule.id;
    alert.severity = rule.severity;
    alert.status = AlertStatus.NEW;
    alert.explanation = explanation;
    alert.confidenceScore = confidenceScore;
    alert.additionalData = additionalData;
    alert.insuranceCompanyId = claim.insuranceCompanyId;
    
    return alert;
  }
}

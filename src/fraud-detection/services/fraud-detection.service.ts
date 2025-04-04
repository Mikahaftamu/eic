import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FraudRule, RuleStatus } from '../entities/fraud-rule.entity';
import { ClaimFraudAlert, AlertStatus, AlertResolution } from '../entities/claim-fraud-alert.entity';
import { RuleBasedDetectionService } from './rule-based-detection.service';
import { CreateFraudRuleDto } from '../dto/create-fraud-rule.dto';
import { UpdateFraudRuleDto } from '../dto/update-fraud-rule.dto';
import { UpdateAlertStatusDto } from '../dto/update-alert-status.dto';

@Injectable()
export class FraudDetectionService {
  constructor(
    @InjectRepository(FraudRule)
    private fraudRuleRepository: Repository<FraudRule>,
    @InjectRepository(ClaimFraudAlert)
    private claimFraudAlertRepository: Repository<ClaimFraudAlert>,
    private ruleBasedDetectionService: RuleBasedDetectionService,
  ) {}

  // Rule management methods
  async createRule(createFraudRuleDto: CreateFraudRuleDto): Promise<FraudRule> {
    const rule = this.fraudRuleRepository.create(createFraudRuleDto);
    return this.fraudRuleRepository.save(rule);
  }

  async findAllRules(insuranceCompanyId?: string): Promise<FraudRule[]> {
    const queryBuilder = this.fraudRuleRepository.createQueryBuilder('rule');
    
    if (insuranceCompanyId) {
      queryBuilder.where('rule.insuranceCompanyId = :insuranceCompanyId OR rule.isSystemWide = true', {
        insuranceCompanyId,
      });
    }
    
    return queryBuilder.orderBy('rule.createdAt', 'DESC').getMany();
  }

  async findRuleById(id: string): Promise<FraudRule> {
    const rule = await this.fraudRuleRepository.findOne({ where: { id } });
    if (!rule) {
      throw new NotFoundException(`Fraud rule with ID ${id} not found`);
    }
    return rule;
  }

  async updateRule(id: string, updateFraudRuleDto: UpdateFraudRuleDto): Promise<FraudRule> {
    await this.fraudRuleRepository.update(id, updateFraudRuleDto);
    return this.findRuleById(id);
  }

  async activateRule(id: string): Promise<FraudRule> {
    await this.fraudRuleRepository.update(id, { status: RuleStatus.ACTIVE });
    return this.findRuleById(id);
  }

  async deactivateRule(id: string): Promise<FraudRule> {
    await this.fraudRuleRepository.update(id, { status: RuleStatus.INACTIVE });
    return this.findRuleById(id);
  }

  async removeRule(id: string): Promise<void> {
    await this.fraudRuleRepository.delete(id);
  }

  // Alert management methods
  async findAllAlerts(
    insuranceCompanyId: string,
    status?: AlertStatus,
    severity?: string,
    fromDate?: Date,
    toDate?: Date,
    page = 1,
    limit = 20,
  ): Promise<{ alerts: ClaimFraudAlert[]; total: number }> {
    const queryBuilder = this.claimFraudAlertRepository.createQueryBuilder('alert')
      .leftJoinAndSelect('alert.rule', 'rule')
      .where('alert.insuranceCompanyId = :insuranceCompanyId', { insuranceCompanyId });
    
    if (status) {
      queryBuilder.andWhere('alert.status = :status', { status });
    }
    
    if (severity) {
      queryBuilder.andWhere('alert.severity = :severity', { severity });
    }
    
    if (fromDate) {
      queryBuilder.andWhere('alert.createdAt >= :fromDate', { fromDate });
    }
    
    if (toDate) {
      queryBuilder.andWhere('alert.createdAt <= :toDate', { toDate });
    }
    
    const total = await queryBuilder.getCount();
    
    const alerts = await queryBuilder
      .orderBy('alert.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();
    
    return { alerts, total };
  }

  async findAlertById(id: string): Promise<ClaimFraudAlert> {
    const alert = await this.claimFraudAlertRepository.findOne({ 
      where: { id },
      relations: ['rule']
    });
    
    if (!alert) {
      throw new NotFoundException(`Fraud alert with ID ${id} not found`);
    }
    
    return alert;
  }

  async updateAlertStatus(id: string, updateStatusDto: UpdateAlertStatusDto): Promise<ClaimFraudAlert> {
    const alert = await this.findAlertById(id);
    
    alert.status = updateStatusDto.status;
    
    if (updateStatusDto.resolution) {
      alert.resolution = updateStatusDto.resolution;
    }
    
    if (updateStatusDto.reviewNotes) {
      alert.reviewNotes = updateStatusDto.reviewNotes;
    }
    
    alert.reviewedByUserId = updateStatusDto.reviewedByUserId;
    alert.reviewedAt = new Date();
    
    return this.claimFraudAlertRepository.save(alert);
  }

  // Fraud detection methods
  async detectFraudForClaim(claimId: string, insuranceCompanyId: string): Promise<ClaimFraudAlert[]> {
    return this.ruleBasedDetectionService.analyzeClaimForFraud(claimId, insuranceCompanyId);
  }

  async getAlertStatistics(insuranceCompanyId: string): Promise<any> {
    // Get counts by status
    const statusCounts = await this.claimFraudAlertRepository
      .createQueryBuilder('alert')
      .select('alert.status', 'status')
      .addSelect('COUNT(alert.id)', 'count')
      .where('alert.insuranceCompanyId = :insuranceCompanyId', { insuranceCompanyId })
      .groupBy('alert.status')
      .getRawMany();
    
    // Get counts by severity
    const severityCounts = await this.claimFraudAlertRepository
      .createQueryBuilder('alert')
      .select('alert.severity', 'severity')
      .addSelect('COUNT(alert.id)', 'count')
      .where('alert.insuranceCompanyId = :insuranceCompanyId', { insuranceCompanyId })
      .groupBy('alert.severity')
      .getRawMany();
    
    // Get counts by rule type
    const ruleTypeCounts = await this.claimFraudAlertRepository
      .createQueryBuilder('alert')
      .leftJoin('alert.rule', 'rule')
      .select('rule.type', 'ruleType')
      .addSelect('COUNT(alert.id)', 'count')
      .where('alert.insuranceCompanyId = :insuranceCompanyId', { insuranceCompanyId })
      .groupBy('rule.type')
      .getRawMany();
    
    // Get trend data (last 12 months)
    const now = new Date();
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(now.getMonth() - 12);
    
    const monthlyTrend = await this.claimFraudAlertRepository
      .createQueryBuilder('alert')
      .select("DATE_TRUNC('month', alert.createdAt)", 'month')
      .addSelect('COUNT(alert.id)', 'count')
      .where('alert.insuranceCompanyId = :insuranceCompanyId', { insuranceCompanyId })
      .andWhere('alert.createdAt >= :twelveMonthsAgo', { twelveMonthsAgo })
      .groupBy("DATE_TRUNC('month', alert.createdAt)")
      .orderBy("DATE_TRUNC('month', alert.createdAt)", 'ASC')
      .getRawMany();
    
    return {
      statusCounts,
      severityCounts,
      ruleTypeCounts,
      monthlyTrend
    };
  }
}

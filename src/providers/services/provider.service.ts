import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, IsNull, Not } from 'typeorm';
import { Provider } from '../entities/provider.entity';
import { Claim } from '../../claims/entities/claim.entity';
import { ClaimStatus } from '../../claims/entities/claim.entity';

@Injectable()
export class ProviderService {
  private readonly logger = new Logger(ProviderService.name);

  constructor(
    @InjectRepository(Provider)
    private readonly providerRepository: Repository<Provider>,
    @InjectRepository(Claim)
    private readonly claimRepository: Repository<Claim>,
  ) {}

  async findById(id: string): Promise<Provider> {
    const provider = await this.providerRepository.findOne({
      where: { id },
    });

    if (!provider) {
      throw new NotFoundException(`Provider with ID ${id} not found`);
    }

    return provider;
  }

  async findAll(): Promise<Provider[]> {
    return this.providerRepository.find();
  }

  async getActiveProvidersCount(insuranceCompanyId: string): Promise<number> {
    return this.providerRepository.count({
      where: { 
        insuranceCompanyId,
        isActive: true 
      },
    });
  }

  async getProviderPerformanceMetrics(
    insuranceCompanyId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<any[]> {
    try {
      this.logger.debug(`Getting provider performance metrics for company ${insuranceCompanyId}`);

      const metrics = await this.providerRepository
        .createQueryBuilder('provider')
        .select('provider.id', 'providerId')
        .addSelect('provider.name', 'providerName')
        .addSelect('COUNT(DISTINCT claim.id)', 'claimsProcessed')
        .addSelect('AVG(EXTRACT(EPOCH FROM (claim.updatedAt - claim.createdAt))/86400)', 'avgProcessingTime')
        .addSelect('(COUNT(CASE WHEN claim.status = :approvedStatus THEN 1 END) * 100.0 / NULLIF(COUNT(claim.id), 0))', 'approvalRate')
        .leftJoin('claim', 'claim', 'claim.providerId = provider.id AND claim.createdAt BETWEEN :startDate AND :endDate')
        .where('provider.insuranceCompanyId = :insuranceCompanyId', { insuranceCompanyId })
        .groupBy('provider.id')
        .addGroupBy('provider.name')
        .setParameter('approvedStatus', ClaimStatus.APPROVED)
        .setParameter('startDate', startDate)
        .setParameter('endDate', endDate)
        .getRawMany();

      return metrics.map(metric => ({
        providerId: metric.providerId,
        providerName: metric.providerName,
        claimsProcessed: parseInt(metric.claimsProcessed) || 0,
        avgProcessingTime: parseFloat(metric.avgProcessingTime) || 0,
        approvalRate: parseFloat(metric.approvalRate) || 0,
      }));
    } catch (error) {
      this.logger.error(`Error getting provider performance metrics: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getTopProviders(
    insuranceCompanyId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<any[]> {
    try {
      this.logger.debug(`Getting top providers for company ${insuranceCompanyId}`);

      const topProviders = await this.providerRepository
        .createQueryBuilder('provider')
        .select('provider.id', 'providerId')
        .addSelect('provider.name', 'providerName')
        .addSelect('COUNT(DISTINCT claim.id)', 'claimsCount')
        .addSelect('COALESCE(SUM(claim.totalAmount), 0)', 'claimsAmount')
        .leftJoin('claim', 'claim', 'claim.providerId = provider.id AND claim.createdAt BETWEEN :startDate AND :endDate')
        .where('provider.insuranceCompanyId = :insuranceCompanyId', { insuranceCompanyId })
        .groupBy('provider.id')
        .addGroupBy('provider.name')
        .orderBy('claimsAmount', 'DESC')
        .limit(10)
        .setParameter('startDate', startDate)
        .setParameter('endDate', endDate)
        .getRawMany();

      return topProviders.map(provider => ({
        providerId: provider.providerId,
        providerName: provider.providerName,
        claimsCount: parseInt(provider.claimsCount) || 0,
        claimsAmount: parseFloat(provider.claimsAmount) || 0,
      }));
    } catch (error) {
      this.logger.error(`Error getting top providers: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getProviderSatisfactionRatings(
    insuranceCompanyId: string,
  ): Promise<any[]> {
    try {
      this.logger.debug(`Getting provider satisfaction ratings for company ${insuranceCompanyId}`);

      const ratings = await this.providerRepository
        .createQueryBuilder('provider')
        .select('provider.id', 'providerId')
        .addSelect('provider.name', 'providerName')
        .addSelect('COALESCE(AVG(provider.rating), 0)', 'averageRating')
        .addSelect('COUNT(provider.rating)', 'ratingsCount')
        .where('provider.insuranceCompanyId = :insuranceCompanyId', { insuranceCompanyId })
        .groupBy('provider.id')
        .addGroupBy('provider.name')
        .getRawMany();

      return ratings.map(rating => ({
        providerId: rating.providerId,
        providerName: rating.providerName,
        averageRating: parseFloat(rating.averageRating) || 0,
        ratingsCount: parseInt(rating.ratingsCount) || 0,
      }));
    } catch (error) {
      this.logger.error(`Error getting provider satisfaction ratings: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getProviderNetworkStatus(insuranceCompanyId: string): Promise<any> {
    try {
      this.logger.debug(`Getting provider network status for company ${insuranceCompanyId}`);

      const networkStats = await this.providerRepository
        .createQueryBuilder('provider')
        .select('provider.status', 'status')
        .addSelect('COUNT(provider.id)', 'count')
        .where('provider.insuranceCompanyId = :insuranceCompanyId', { insuranceCompanyId })
        .groupBy('provider.status')
        .getRawMany();

      const totalProviders = await this.providerRepository.count({
        where: { insuranceCompanyId },
      });

      const activeProviders = await this.providerRepository.count({
        where: { 
          insuranceCompanyId,
          isActive: true,
        },
      });

      return {
        totalProviders,
        activeProviders,
        statusDistribution: networkStats.map(stat => ({
          status: stat.status || 'UNKNOWN',
          count: parseInt(stat.count) || 0,
          percentage: totalProviders > 0 ? (parseInt(stat.count) / totalProviders) * 100 : 0,
        })),
        activePercentage: totalProviders > 0 ? (activeProviders / totalProviders) * 100 : 0,
      };
    } catch (error) {
      this.logger.error(`Error getting provider network status: ${error.message}`, error.stack);
      throw error;
    }
  }
}

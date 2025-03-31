import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Provider } from '../entities/provider.entity';

@Injectable()
export class ProviderService {
  constructor(
    @InjectRepository(Provider)
    private providerRepository: Repository<Provider>,
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
    // This would typically join with claims data to calculate metrics
    // For now, we'll return mock data
    return [
      {
        providerId: '1',
        providerName: 'Metro Hospital',
        claimsProcessed: 120,
        avgProcessingTime: 5.2,
        approvalRate: 92.5,
      },
      {
        providerId: '2',
        providerName: 'City Medical Center',
        claimsProcessed: 85,
        avgProcessingTime: 4.8,
        approvalRate: 88.3,
      },
      {
        providerId: '3',
        providerName: 'Westside Clinic',
        claimsProcessed: 65,
        avgProcessingTime: 3.9,
        approvalRate: 94.1,
      },
    ];
  }

  async getTopProviders(
    insuranceCompanyId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<any[]> {
    // This would typically join with claims data to calculate metrics
    // For now, we'll return mock data
    return [
      {
        providerId: '1',
        providerName: 'Metro Hospital',
        claimsCount: 120,
        claimsAmount: 245000,
      },
      {
        providerId: '2',
        providerName: 'City Medical Center',
        claimsCount: 85,
        claimsAmount: 178500,
      },
      {
        providerId: '3',
        providerName: 'Westside Clinic',
        claimsCount: 65,
        claimsAmount: 112000,
      },
    ];
  }

  async getProviderSatisfactionRatings(
    insuranceCompanyId: string,
  ): Promise<any[]> {
    // This would typically join with ratings data
    // For now, we'll return mock data
    return [
      {
        providerId: '1',
        providerName: 'Metro Hospital',
        averageRating: 4.2,
        ratingsCount: 156,
      },
      {
        providerId: '2',
        providerName: 'City Medical Center',
        averageRating: 4.5,
        ratingsCount: 98,
      },
      {
        providerId: '3',
        providerName: 'Westside Clinic',
        averageRating: 4.8,
        ratingsCount: 72,
      },
    ];
  }
}

import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CorporateClient } from './entities/corporate-client.entity';
import { CoveragePlan } from './entities/coverage-plan.entity';
import { CreateCorporateClientDto } from './dto/create-corporate-client.dto';
import { UpdateCorporateStatusDto } from './dto/update-corporate-status.dto';
import { AdminService } from '../admin/admin.service';
import { AdminType } from '../common/enums/admin-type.enum';

@Injectable()
export class CorporateService {
  constructor(
    @InjectRepository(CorporateClient)
    private readonly corporateRepository: Repository<CorporateClient>,
    @InjectRepository(CoveragePlan)
    private readonly coveragePlanRepository: Repository<CoveragePlan>,
    private readonly adminService: AdminService,
  ) {}

  async createCorporateClient(dto: CreateCorporateClientDto): Promise<CorporateClient> {
    // Check if company with same name or registration exists
    const existing = await this.corporateRepository.findOne({
      where: [
        { name: dto.name },
        { registrationNumber: dto.registrationNumber }
      ]
    });

    if (existing) {
      throw new ConflictException(
        `Corporate client with same ${existing.name === dto.name ? 'name' : 'registration number'} already exists`
      );
    }

    // Create the corporate client
    const client = this.corporateRepository.create({
      name: dto.name,
      registrationNumber: dto.registrationNumber,
      address: dto.address,
      phone: dto.phone,
      email: dto.email,
      website: dto.website,
      contactPerson: dto.contactPerson,
      insuranceCompanyId: dto.insuranceCompanyId,
      contractDetails: {
        ...dto.contractDetails,
        startDate: new Date(dto.contractDetails.startDate),
        endDate: new Date(dto.contractDetails.endDate)
      },
      isActive: true
    });

    // Save the client first to get its ID
    const savedClient = await this.corporateRepository.save(client);

    // Create coverage plans
    const coveragePlans = dto.coveragePlans.map(planDto => 
      this.coveragePlanRepository.create({
        ...planDto,
        corporateClientId: savedClient.id,
        isActive: true
      })
    );

    await this.coveragePlanRepository.save(coveragePlans);

    // Create admin account for the corporate client
    await this.adminService.createAdmin({
      username: dto.adminCredentials.username,
      password: dto.adminCredentials.password,
      email: dto.adminCredentials.email,
      adminType: AdminType.CORPORATE_ADMIN,
      insuranceCompanyId: dto.insuranceCompanyId,
      corporateClientId: savedClient.id,
      firstName: dto.adminCredentials.firstName || dto.adminCredentials.username,
      lastName: dto.adminCredentials.lastName || 'Admin',
      phoneNumber: dto.adminCredentials.phoneNumber || dto.phone
    });

    const result = await this.corporateRepository.findOne({
      where: { id: savedClient.id },
      relations: ['coveragePlans']
    });

    if (!result) {
      throw new NotFoundException('Failed to retrieve created corporate client');
    }

    return result;
  }

  async findAll(): Promise<CorporateClient[]> {
    return this.corporateRepository.find({
      relations: ['coveragePlans']
    });
  }

  async findOne(id: string): Promise<CorporateClient> {
    const client = await this.corporateRepository.findOne({
      where: { id },
      relations: ['coveragePlans']
    });

    if (!client) {
      throw new NotFoundException('Corporate client not found');
    }

    return client;
  }

  async findByInsuranceCompany(insuranceCompanyId: string): Promise<CorporateClient[]> {
    return this.corporateRepository.find({
      where: { insuranceCompanyId },
      relations: ['coveragePlans']
    });
  }

  async updateStatus(id: string, updateStatusDto: UpdateCorporateStatusDto): Promise<CorporateClient> {
    const client = await this.findOne(id);
    
    // Update status
    client.isActive = updateStatusDto.isActive;

    // Add status change information to notes
    const statusChangeNote = `Status changed to ${updateStatusDto.isActive ? 'active' : 'inactive'}`;
    const reasonNote = updateStatusDto.reason ? `Reason: ${updateStatusDto.reason}` : '';
    const effectiveDateNote = updateStatusDto.effectiveDate ? `Effective date: ${updateStatusDto.effectiveDate}` : '';
    const referenceNote = updateStatusDto.referenceNumber ? `Reference: ${updateStatusDto.referenceNumber}` : '';
    
    const notes = [
      statusChangeNote,
      reasonNote,
      effectiveDateNote,
      referenceNote,
      updateStatusDto.notes
    ].filter(Boolean).join('\n');

    client.notes = client.notes ? `${client.notes}\n\n${notes}` : notes;

    return this.corporateRepository.save(client);
  }

  async updateCoveragePlan(clientId: string, planId: string, updates: Partial<CoveragePlan>): Promise<CoveragePlan> {
    const plan = await this.coveragePlanRepository.findOne({
      where: { 
        id: planId,
        corporateClientId: clientId
      }
    });

    if (!plan) {
      throw new NotFoundException('Coverage plan not found');
    }

    Object.assign(plan, updates);
    return this.coveragePlanRepository.save(plan);
  }
}
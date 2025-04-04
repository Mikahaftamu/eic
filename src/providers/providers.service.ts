import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Provider } from './entities/provider.entity';
import { Admin } from '../admin/entities/admin.entity';
import { CreateProviderDto } from './dto/create-provider.dto';
import { ResetProviderPasswordDto } from './dto/reset-provider-password.dto';
import { UserType } from '../common/enums/user-type.enum';
import { AdminType } from '../common/enums/admin-type.enum';
import { HealthFacilityType } from './enums/health-facility-type.enum';

export interface ProviderWithAdmin {
  provider: Provider;
  adminCredentials: {
    username: string;
    email: string;
  };
}

@Injectable()
export class ProvidersService {
  constructor(
    @InjectRepository(Provider)
    private readonly providerRepository: Repository<Provider>,
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
  ) {}

  async create(
    insuranceCompanyId: string,
    createDto: CreateProviderDto,
  ): Promise<ProviderWithAdmin> {
    // Check for existing provider with same facility name
    const existingProvider = await this.providerRepository.findOne({
      where: { facilityName: createDto.facilityName },
    });

    if (existingProvider) {
      throw new ConflictException('Provider with this facility name already exists');
    }

    // Check for existing admin
    const existingAdmin = await this.adminRepository.findOne({
      where: [
        { username: createDto.admin.username },
        { email: createDto.admin.email },
      ],
    });

    if (existingAdmin) {
      throw new ConflictException('Admin with this username or email already exists');
    }

    // Hash the provided password
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(createDto.admin.password, salt);

    // Create provider with all required fields
    const provider = this.providerRepository.create({
      insuranceCompanyId,
      // Base user fields
      username: createDto.admin.username,
      email: createDto.admin.email,
      password: hashedPassword,
      firstName: createDto.admin.firstName,
      lastName: createDto.admin.lastName,
      phoneNumber: createDto.admin.phoneNumber,
      userType: UserType.PROVIDER,
      isActive: true,
      // Provider specific fields
      facilityName: createDto.facilityName,
      name: createDto.facilityName,
      phone: createDto.admin.phoneNumber,
      address: createDto.location.address,
      category: createDto.category,
      facilityType: createDto.facilityType,
      healthFacilityType: createDto.facilityType || HealthFacilityType.PRIMARY_HOSPITAL,
      licenseNumber: createDto.licenseNumber,
      licenseExpiryDate: new Date(createDto.licenseExpiryDate),
      taxId: createDto.taxId,
      location: createDto.location,
      specialties: [],
      services: [], // Initialize empty services array
      facilityServices: [], // Initialize empty facilityServices array
      active: true
    });

    await this.providerRepository.save(provider);

    // Create admin for the provider
    const admin = this.adminRepository.create({
      username: createDto.admin.username,
      email: createDto.admin.email,
      firstName: createDto.admin.firstName,
      lastName: createDto.admin.lastName,
      phoneNumber: createDto.admin.phoneNumber,
      password: hashedPassword,
      userType: UserType.ADMIN,
      adminType: AdminType.PROVIDER_ADMIN,
      insuranceCompanyId,
      isActive: true
    });

    await this.adminRepository.save(admin);

    return {
      provider,
      adminCredentials: {
        username: createDto.admin.username,
        email: createDto.admin.email,
      },
    };
  }

  async findAll(): Promise<Provider[]> {
    return this.providerRepository.find();
  }

  async findOne(id: string): Promise<Provider> {
    const provider = await this.providerRepository.findOne({ where: { id } });
    if (!provider) {
      throw new NotFoundException('Provider not found');
    }
    return provider;
  }

  async findByInsuranceCompany(insuranceCompanyId: string): Promise<Provider[]> {
    return this.providerRepository.find({ where: { insuranceCompanyId } });
  }

  async findProviderAdmins(insuranceCompanyId: string): Promise<Provider[]> {
    return this.providerRepository.find({
      where: { insuranceCompanyId },
      relations: ['admin'],
    });
  }

  async findProviderAdminById(insuranceCompanyId: string, providerId: string): Promise<Provider> {
    const provider = await this.providerRepository.findOne({
      where: { id: providerId, insuranceCompanyId },
      relations: ['admin'],
    });

    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    return provider;
  }

  async remove(id: string): Promise<void> {
    const provider = await this.findOne(id);
    await this.providerRepository.remove(provider);
  }

  async resetPassword(
    insuranceCompanyId: string,
    resetPasswordDto: ResetProviderPasswordDto,
  ): Promise<void> {
    const provider = await this.findProviderAdminById(
      insuranceCompanyId,
      resetPasswordDto.providerId,
    );

    if (!provider.admin) {
      throw new NotFoundException('Provider admin not found');
    }

    // Hash the new password
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(resetPasswordDto.newPassword, salt);

    // Update the password
    provider.admin.password = hashedPassword;
    await this.adminRepository.save(provider.admin);
  }
}

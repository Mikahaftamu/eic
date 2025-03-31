import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, FindOptionsWhere } from 'typeorm';
import { InsuranceCompany } from './entities/insurance-company.entity';
import { CreateInsuranceCompanyDto } from './dto/create-insurance-company.dto';
import { UpdateInsuranceCompanyDto } from './dto/update-insurance-company.dto';
import { Admin } from '../admin/entities/admin.entity';
import { UserType } from '../common/enums/user-type.enum';
import { AdminType } from '../common/enums/admin-type.enum';
import * as bcrypt from 'bcrypt';

interface InsuranceCompanyWithAdmin extends InsuranceCompany {
  adminCredentials: {
    username: string;
    password: string;
    email: string;
  };
}

@Injectable()
export class InsuranceService {
  constructor(
    @InjectRepository(InsuranceCompany)
    private insuranceCompanyRepository: Repository<InsuranceCompany>,
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
  ) {}

  async create(createDto: CreateInsuranceCompanyDto): Promise<InsuranceCompany> {
    const { adminCredentials, ...companyData } = createDto;

    // Check for existing company
    const existingCompany = await this.insuranceCompanyRepository.findOne({
      where: [
        { name: companyData.name },
        { code: companyData.code }
      ]
    });

    if (existingCompany) {
      throw new ConflictException('Insurance company with this name or code already exists');
    }

    // Create insurance company
    const company = this.insuranceCompanyRepository.create(companyData);
    company.email = companyData.email || null;
    company.website = companyData.website || null;
    company.description = companyData.description || null;
    company.settings = companyData.settings || {};
    const savedCompany = await this.insuranceCompanyRepository.save(company);

    // Create admin for the company
    try {
      const admin = this.adminRepository.create({
        ...adminCredentials,
        password: await bcrypt.hash(adminCredentials.password, 10),
        userType: UserType.ADMIN,
        adminType: AdminType.INSURANCE_ADMIN,
        insuranceCompanyId: savedCompany.id,
        email: adminCredentials.email || null,
      });

      await this.adminRepository.save(admin);
    } catch (error) {
      // If admin creation fails, rollback company creation
      await this.insuranceCompanyRepository.remove(savedCompany);
      throw error;
    }

    return savedCompany;
  }

  async findAll(): Promise<InsuranceCompany[]> {
    return this.insuranceCompanyRepository.find();
  }

  async findOne(id: string): Promise<InsuranceCompany> {
    const company = await this.insuranceCompanyRepository.findOne({
      where: { id },
      relations: {
        members: true,
        providers: true,
        staff: true,
        admins: true
      }
    });

    if (!company) {
      throw new NotFoundException('Insurance company not found');
    }

    return company;
  }

  async findByCode(code: string): Promise<InsuranceCompany> {
    const company = await this.insuranceCompanyRepository.findOne({
      where: { code },
    });

    if (!company) {
      throw new NotFoundException('Insurance company not found');
    }

    return company;
  }

  async update(id: string, updateDto: UpdateInsuranceCompanyDto): Promise<InsuranceCompany> {
    const company = await this.findOne(id);

    // Check for unique constraints if updating these fields
    if (updateDto.name || updateDto.code || updateDto.email) {
      const whereConditions: FindOptionsWhere<InsuranceCompany>[] = [];
      
      if (updateDto.name) {
        whereConditions.push({
          name: updateDto.name,
          id: Not(id),
        } as FindOptionsWhere<InsuranceCompany>);
      }
      if (updateDto.code) {
        whereConditions.push({
          code: updateDto.code,
          id: Not(id),
        } as FindOptionsWhere<InsuranceCompany>);
      }
      if (updateDto.email) {
        whereConditions.push({
          email: updateDto.email,
          id: Not(id),
        } as FindOptionsWhere<InsuranceCompany>);
      }

      const existingCompany = await this.insuranceCompanyRepository.findOne({
        where: whereConditions,
      });

      if (existingCompany) {
        throw new ConflictException('Insurance company with this name, code, or email already exists');
      }
    }

    Object.assign(company, updateDto);
    return this.insuranceCompanyRepository.save(company);
  }

  async remove(id: string): Promise<void> {
    const company = await this.findOne(id);
    await this.insuranceCompanyRepository.remove(company);
  }

  async toggleActive(id: string): Promise<InsuranceCompany> {
    const company = await this.findOne(id);
    company.isActive = !company.isActive;
    return this.insuranceCompanyRepository.save(company);
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InsuranceCompany } from '../entities/insurance-company.entity';

@Injectable()
export class InsuranceCompanyService
{
  constructor(
    @InjectRepository(InsuranceCompany)
    private insuranceCompanyRepository: Repository<InsuranceCompany>,
  ) { }

  async findById(id: string): Promise<InsuranceCompany>
  {
    const company = await this.insuranceCompanyRepository.findOne({
      where: { id },
    });

    if (!company)
    {
      throw new NotFoundException(`Insurance company with ID ${id} not found`);
    }

    return company;
  }

  async findAll(): Promise<InsuranceCompany[]>
  {
    return this.insuranceCompanyRepository.find();
  }

  async getActiveCompaniesCount(): Promise<number>
  {
    return this.insuranceCompanyRepository.count({
      where: { isActive: true },
    });
  }
}

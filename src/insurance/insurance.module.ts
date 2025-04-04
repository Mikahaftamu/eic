import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InsuranceService } from './insurance.service';
import { InsuranceController } from './insurance.controller';
import { InsuranceCompany } from './entities/insurance-company.entity';
import { Admin } from '../admin/entities/admin.entity';
import { PolicyContract } from './entities/policy-contract.entity';
import { Member } from '../members/entities/member.entity';
import { InsuranceCompanyService } from './services/insurance-company.service';
import { PolicyContractService } from './services/policy-contract.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([InsuranceCompany, Admin, PolicyContract, Member]),
  ],
  providers: [InsuranceService, InsuranceCompanyService, PolicyContractService],
  controllers: [InsuranceController],
  exports: [InsuranceService, InsuranceCompanyService, PolicyContractService],
})
export class InsuranceModule {}

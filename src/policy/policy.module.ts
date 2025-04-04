import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PolicyProduct } from './entities/policy-product.entity';
import { PolicyContract } from './entities/policy-contract.entity';
import { Member } from '../members/entities/member.entity';
import { PolicyService } from './policy.service';
import { PolicyController } from './policy.controller';
import { PolicyContractService } from './services/policy-contract.service';
import { PolicyContractController } from './controllers/policy-contract.controller';
import { PremiumCalculatorService } from './services/premium-calculator.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([PolicyProduct, PolicyContract, Member])
  ],
  controllers: [PolicyController, PolicyContractController],
  providers: [PolicyService, PolicyContractService, PremiumCalculatorService],
  exports: [PolicyService, PolicyContractService, PremiumCalculatorService],
})
export class PolicyModule {}

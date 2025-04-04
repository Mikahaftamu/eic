import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FraudDetectionService } from './services/fraud-detection.service';
import { RuleBasedDetectionService } from './services/rule-based-detection.service';
import { FraudDetectionController } from './controllers/fraud-detection.controller';
import { ClaimFraudAlert } from './entities/claim-fraud-alert.entity';
import { FraudRule } from './entities/fraud-rule.entity';
import { ClaimsModule } from '../claims/claims.module';
import { MedicalCatalogModule } from '../medical-catalog/medical-catalog.module';
import { PolicyModule } from '../policy/policy.module';
import { ProvidersModule } from '../providers/providers.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ClaimFraudAlert,
      FraudRule
    ]),
    ClaimsModule,
    MedicalCatalogModule,
    PolicyModule,
    ProvidersModule
  ],
  controllers: [FraudDetectionController],
  providers: [
    FraudDetectionService,
    RuleBasedDetectionService
  ],
  exports: [
    FraudDetectionService,
    RuleBasedDetectionService
  ]
})
export class FraudDetectionModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { BillingModule } from '../billing/billing.module';
import { ClaimsModule } from '../claims/claims.module';
import { InsuranceModule } from '../insurance/insurance.module';
import { ProvidersModule } from '../providers/providers.module';
import { PolicyModule } from '../policy/policy.module';

@Module({
  imports: [
    BillingModule,
    ClaimsModule,
    InsuranceModule,
    ProvidersModule,
    PolicyModule,
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}

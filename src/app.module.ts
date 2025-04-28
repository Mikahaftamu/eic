import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { InsuranceModule } from './insurance/insurance.module';
import { ProvidersModule } from './providers/providers.module';
import { CorporateModule } from './corporate/corporate.module';
import { Member } from './members/entities/member.entity';
import { Provider } from './providers/entities/provider.entity';
import { Staff } from './staff/entities/staff.entity';
import { Admin } from './admin/entities/admin.entity';
import { InsuranceCompany } from './insurance/entities/insurance-company.entity';
import { CorporateClient } from './corporate/entities/corporate-client.entity';
import { CoveragePlan } from './corporate/entities/coverage-plan.entity';
import { AdminSeeder } from './database/seeders/admin.seeder';
import databaseConfig from './config/database.config';
import { PolicyModule } from './policy/policy.module';
import { PolicyProduct } from './policy/entities/policy-product.entity';
import { PolicyContract } from './policy/entities/policy-contract.entity';
import { ClaimsModule } from './claims/claims.module';
import { BillingModule } from './billing/billing.module';
import { Invoice } from './billing/entities/invoice.entity';
import { InvoiceItem } from './billing/entities/invoice-item.entity';
import { Payment } from './billing/entities/payment.entity';
import { PaymentPlan } from './billing/entities/payment-plan.entity';
import { AnalyticsModule } from './analytics/analytics.module';
import { MedicalCatalogModule } from './medical-catalog/medical-catalog.module';
import { FraudDetectionModule } from './fraud-detection/fraud-detection.module';
import { MedicalCategoryEntity } from './medical-catalog/entities/medical-category.entity';
import { MedicalItemEntity } from './medical-catalog/entities/medical-item.entity';
import { MedicalServiceEntity } from './medical-catalog/entities/medical-service.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const dbConfig = configService.get('database');
        return {
          type: 'postgres',
          host: dbConfig.host,
          port: dbConfig.port,
          username: dbConfig.username,
          password: dbConfig.password,
          database: dbConfig.name,
          entities: [
            Member,
            Provider,
            Staff,
            Admin,
            InsuranceCompany,
            CorporateClient,
            CoveragePlan,
            PolicyProduct,
            PolicyContract,
            Invoice,
            InvoiceItem,
            Payment,
            PaymentPlan,
            MedicalCategoryEntity,
            MedicalItemEntity,
            MedicalServiceEntity,
          ],
          synchronize: false,
          migrations: [__dirname + '/database/migrations/*.ts'],
          migrationsRun: true,
          logging: true
        };
      },
    }),
    AuthModule,
    AdminModule,
    InsuranceModule,
    ProvidersModule,
    CorporateModule,
    PolicyModule,
    ClaimsModule,
    BillingModule,
    AnalyticsModule,
    MedicalCatalogModule,
    FraudDetectionModule,
  ],
  controllers: [AppController],
  providers: [AppService, AdminSeeder],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly adminSeeder: AdminSeeder) {}

  async onModuleInit() {
    await this.adminSeeder.seed();
  }
}

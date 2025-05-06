import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProvidersService } from './providers.service';
import { ProvidersController } from './providers.controller';
import { Provider } from './entities/provider.entity';
import { Admin } from '../admin/entities/admin.entity';
import { InsuranceCompany } from '../insurance/entities/insurance-company.entity';
import { ProviderService } from './services/provider.service';
import { ProviderServiceEntity } from '../medical-catalog/entities/provider-service.entity';
import { Claim } from '../claims/entities/claim.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Provider,
      Admin,
      InsuranceCompany,
      ProviderServiceEntity,
      Claim,
    ]),
  ],
  controllers: [ProvidersController],
  providers: [ProvidersService, ProviderService],
  exports: [
    ProvidersService,
    ProviderService,
    TypeOrmModule.forFeature([
      Provider,
      ProviderServiceEntity,
    ]),
  ],
})
export class ProvidersModule {}

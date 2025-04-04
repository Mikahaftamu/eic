import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProvidersService } from './providers.service';
import { ProvidersController } from './providers.controller';
import { Provider } from './entities/provider.entity';
import { Admin } from '../admin/entities/admin.entity';
import { InsuranceCompany } from '../insurance/entities/insurance-company.entity';
import { ProviderService } from './services/provider.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Provider, Admin, InsuranceCompany]),
  ],
  controllers: [ProvidersController],
  providers: [ProvidersService, ProviderService],
  exports: [ProvidersService, ProviderService],
})
export class ProvidersModule {}

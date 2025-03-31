import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CorporateService } from './corporate.service';
import { CorporateController } from './corporate.controller';
import { CorporateClient } from './entities/corporate-client.entity';
import { CoveragePlan } from './entities/coverage-plan.entity';
import { AdminModule } from '../admin/admin.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CorporateClient, CoveragePlan]),
    AdminModule
  ],
  controllers: [CorporateController],
  providers: [CorporateService],
  exports: [CorporateService]
})
export class CorporateModule {}
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClaimsController } from './claims.controller';
import { ClaimsService } from './claims.service';
import { Claim } from './entities/claim.entity';
import { ClaimItem } from './entities/claim-item.entity';
import { ClaimAdjustment } from './entities/claim-adjustment.entity';
import { ClaimAppeal } from './entities/claim-appeal.entity';
import { ClaimAdjudicationService } from './services/claim-adjudication.service';
import { MembersModule } from '../members/members.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Claim,
      ClaimItem,
      ClaimAdjustment,
      ClaimAppeal,
    ]),
    MembersModule,
  ],
  controllers: [ClaimsController],
  providers: [ClaimsService, ClaimAdjudicationService],
  exports: [ClaimsService, ClaimAdjudicationService],
})
export class ClaimsModule {}

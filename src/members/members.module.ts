import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Member } from './entities/member.entity';
import { MembersService } from './members.service';
import { MembersController } from './members.controller';
import { PolicyModule } from '../policy/policy.module';
import { IDCardService } from './services/id-card.service';
import { IDCardController } from './controllers/id-card.controller';
import { PolicyProduct } from '../policy/entities/policy-product.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Member, PolicyProduct]),
    PolicyModule,
  ],
  controllers: [MembersController, IDCardController],
  providers: [MembersService, IDCardService],
  exports: [MembersService],
})
export class MembersModule {}

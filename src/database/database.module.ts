import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminModule } from '../admin/admin.module';
import { AdminSeeder } from './seeders/admin.seeder';
import { Admin } from '../admin/entities/admin.entity';
import { MedicalCategoryEntity } from '../medical-catalog/entities/medical-category.entity';
import { MedicalItemEntity } from '../medical-catalog/entities/medical-item.entity';
import { MedicalServiceEntity } from '../medical-catalog/entities/medical-service.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Admin,
      MedicalCategoryEntity,
      MedicalItemEntity,
      MedicalServiceEntity
    ]),
    AdminModule
  ],
  providers: [AdminSeeder],
  exports: [AdminSeeder],
})
export class DatabaseModule {}

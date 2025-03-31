import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicalItemEntity } from './entities/medical-item.entity';
import { MedicalServiceEntity } from './entities/medical-service.entity';
import { MedicalCatalogService } from './services/medical-catalog.service';
import { MedicalItemController } from './controllers/medical-item.controller';
import { MedicalServiceController } from './controllers/medical-service.controller';
import { MedicalCategoryEntity } from './entities/medical-category.entity';
import { MedicalCategoryController } from './controllers/medical-category.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MedicalItemEntity,
      MedicalServiceEntity,
      MedicalCategoryEntity,
    ]),
  ],
  controllers: [
    MedicalItemController,
    MedicalServiceController,
    MedicalCategoryController,
  ],
  providers: [MedicalCatalogService],
  exports: [MedicalCatalogService],
})
export class MedicalCatalogModule {}

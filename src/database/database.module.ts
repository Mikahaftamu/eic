import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminModule } from '../admin/admin.module';
import { AdminSeeder } from './seeders/admin.seeder';
import { Admin } from '../admin/entities/admin.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Admin]),
    AdminModule
  ],
  providers: [AdminSeeder],
  exports: [AdminSeeder],
})
export class DatabaseModule {}

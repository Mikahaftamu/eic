import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { MedicalItemEntity } from './medical-item.entity';
import { MedicalServiceEntity } from './medical-service.entity';

@Entity('medical_categories')
export class MedicalCategoryEntity {
  @ApiProperty({ description: 'Unique identifier for the medical category' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Code for the medical category' })
  @Column({ type: 'varchar', length: 50, unique: true })
  code: string;

  @ApiProperty({ description: 'Name of the medical category' })
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @ApiProperty({ description: 'Description of the medical category' })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({ description: 'Parent category ID if this is a subcategory' })
  @Column({ type: 'uuid', nullable: true })
  parentCategoryId: string;

  @ApiProperty({ description: 'Whether this category is active' })
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @ApiProperty({ description: 'Insurance company ID that owns this category' })
  @Column({ type: 'uuid' })
  insuranceCompanyId: string;

  @OneToMany(() => MedicalItemEntity, item => item.category)
  items: MedicalItemEntity[];

  @OneToMany(() => MedicalServiceEntity, service => service.category)
  services: MedicalServiceEntity[];

  @ApiProperty({ description: 'Date the category was created' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Date the category was last updated' })
  @UpdateDateColumn()
  updatedAt: Date;
}

import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { MedicalCategoryEntity } from './medical-category.entity';

export enum MedicalItemType {
  DRUG = 'DRUG',
  SUPPLY = 'SUPPLY',
  EQUIPMENT = 'EQUIPMENT',
  IMPLANT = 'IMPLANT',
  OTHER = 'OTHER',
}

@Entity('medical_items')
export class MedicalItemEntity {
  @ApiProperty({ description: 'Unique identifier for the medical item' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Code for the medical item (e.g., NDC code for drugs)' })
  @Column({ type: 'varchar', length: 50, unique: true })
  code: string;

  @ApiProperty({ description: 'Name of the medical item' })
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @ApiProperty({ description: 'Description of the medical item' })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({ description: 'Type of medical item', enum: MedicalItemType })
  @Column({ 
    type: 'enum', 
    enum: MedicalItemType, 
    default: MedicalItemType.OTHER 
  })
  type: MedicalItemType;

  @ApiProperty({ description: 'Category ID this item belongs to' })
  @Column({ type: 'uuid' })
  categoryId: string;

  @ManyToOne(() => MedicalCategoryEntity, category => category.items)
  @JoinColumn({ name: 'categoryId' })
  category: MedicalCategoryEntity;

  @ApiProperty({ description: 'Unit of measurement (e.g., tablet, ml, etc.)' })
  @Column({ type: 'varchar', length: 50 })
  unit: string;

  @ApiProperty({ description: 'Base price of the item' })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  basePrice: number;

  @ApiProperty({ description: 'Whether this item requires prior authorization' })
  @Column({ type: 'boolean', default: false })
  requiresPriorAuth: boolean;

  @ApiProperty({ description: 'Whether this item is active in the catalog' })
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @ApiProperty({ description: 'Insurance company ID that owns this item' })
  @Column({ type: 'uuid' })
  insuranceCompanyId: string;

  @ApiProperty({ description: 'Generic alternative codes, if applicable' })
  @Column({ type: 'varchar', array: true, nullable: true })
  genericAlternatives: string[];

  @ApiProperty({ description: 'Brand name, if applicable' })
  @Column({ type: 'varchar', length: 100, nullable: true })
  brandName: string;

  @ApiProperty({ description: 'Manufacturer name, if applicable' })
  @Column({ type: 'varchar', length: 100, nullable: true })
  manufacturer: string;

  @ApiProperty({ description: 'Additional properties as JSON' })
  @Column({ type: 'jsonb', nullable: true })
  additionalProperties: any;

  @ApiProperty({ description: 'Date the item was created' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Date the item was last updated' })
  @UpdateDateColumn()
  updatedAt: Date;
}

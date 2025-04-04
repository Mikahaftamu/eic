import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { MedicalCategoryEntity } from './medical-category.entity';

export enum ServiceType {
  CONSULTATION = 'CONSULTATION',
  PROCEDURE = 'PROCEDURE',
  DIAGNOSTIC = 'DIAGNOSTIC',
  LABORATORY = 'LABORATORY',
  IMAGING = 'IMAGING',
  THERAPY = 'THERAPY',
  PREVENTIVE = 'PREVENTIVE',
  OTHER = 'OTHER',
}

@Entity('medical_services')
export class MedicalServiceEntity {
  @ApiProperty({ description: 'Unique identifier for the medical service' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Code for the medical service (e.g., CPT, HCPCS)' })
  @Column({ type: 'varchar', length: 50, unique: true })
  code: string;

  @ApiProperty({ description: 'Coding system (e.g., CPT, HCPCS, custom)' })
  @Column({ type: 'varchar', length: 50 })
  codingSystem: string;

  @ApiProperty({ description: 'Name of the medical service' })
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @ApiProperty({ description: 'Description of the medical service' })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({ description: 'Type of service', enum: ServiceType })
  @Column({ 
    type: 'enum', 
    enum: ServiceType, 
    default: ServiceType.OTHER 
  })
  type: ServiceType;

  @ApiProperty({ description: 'Category ID this service belongs to' })
  @Column({ type: 'uuid' })
  categoryId: string;

  @ManyToOne(() => MedicalCategoryEntity, category => category.services)
  @JoinColumn({ name: 'categoryId' })
  category: MedicalCategoryEntity;

  @ApiProperty({ description: 'Base price of the service' })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  basePrice: number;

  @ApiProperty({ description: 'Standard duration of the service in minutes' })
  @Column({ type: 'int', nullable: true })
  standardDuration: number;

  @ApiProperty({ description: 'Whether this service requires prior authorization' })
  @Column({ type: 'boolean', default: false })
  requiresPriorAuth: boolean;

  @ApiProperty({ description: 'Whether this service is active in the catalog' })
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @ApiProperty({ description: 'Insurance company ID that owns this service' })
  @Column({ type: 'uuid' })
  insuranceCompanyId: string;

  @ApiProperty({ description: 'Applicable diagnosis codes (ICD-10) that are valid for this service' })
  @Column({ type: 'varchar', array: true, nullable: true })
  applicableDiagnosisCodes: string[];

  @ApiProperty({ description: 'Applicable place of service codes' })
  @Column({ type: 'varchar', array: true, nullable: true })
  placeOfServiceCodes: string[];

  @ApiProperty({ description: 'Valid modifiers for this service code' })
  @Column({ type: 'varchar', array: true, nullable: true })
  validModifiers: string[];

  @ApiProperty({ description: 'Additional properties as JSON' })
  @Column({ type: 'jsonb', nullable: true })
  additionalProperties: any;

  @ApiProperty({ description: 'Date the service was created' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Date the service was last updated' })
  @UpdateDateColumn()
  updatedAt: Date;
}

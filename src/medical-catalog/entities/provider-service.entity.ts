import { Entity, Column, ManyToOne, JoinColumn, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Provider } from '../../providers/entities/provider.entity';
import { MedicalServiceEntity } from './medical-service.entity';

@Entity('provider_services')
export class ProviderServiceEntity {
  @ApiProperty({ description: 'Unique identifier for the provider-service relationship' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Provider ID' })
  @Column({ type: 'uuid' })
  providerId: string;

  @ManyToOne(() => Provider, provider => provider.providerServices)
  @JoinColumn({ name: 'providerId' })
  provider: Provider;

  @ApiProperty({ description: 'Medical Service ID' })
  @Column({ type: 'uuid' })
  serviceId: string;

  @ManyToOne(() => MedicalServiceEntity, service => service.providerServices)
  @JoinColumn({ name: 'serviceId' })
  service: MedicalServiceEntity;

  @ApiProperty({ description: 'Provider-specific price for this service' })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  providerPrice: number;

  @ApiProperty({ description: 'Whether this service is available at this provider' })
  @Column({ type: 'boolean', default: true })
  isAvailable: boolean;

  @ApiProperty({ description: 'Provider-specific notes about the service' })
  @Column({ type: 'text', nullable: true })
  notes: string;

  @ApiProperty({ description: 'Date the relationship was created' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Date the relationship was last updated' })
  @UpdateDateColumn()
  updatedAt: Date;
} 
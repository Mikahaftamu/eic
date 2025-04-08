import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseUser } from '../../common/entities/base-user.entity';
import { UserType } from '../../common/enums/user-type.enum';
import { ProviderCategory } from '../enums/provider-category.enum';
import { HealthFacilityType } from '../enums/health-facility-type.enum';
import { Admin } from '../../admin/entities/admin.entity';

@Entity('providers')
export class Provider extends BaseUser
{
  constructor()
  {
    super();
    this.userType = UserType.PROVIDER;
  }

  @ApiProperty({
    description: 'Name of the healthcare facility',
    example: 'St. Paul\'s Hospital'
  })
  @Column()
  facilityName: string;

  @ApiProperty({
    description: 'Category of the provider',
    enum: ProviderCategory,
    example: ProviderCategory.HEALTH_FACILITY,
    default: ProviderCategory.HEALTH_FACILITY
  })
  @Column({
    type: 'enum',
    enum: ProviderCategory,
    default: ProviderCategory.HEALTH_FACILITY
  })
  category: ProviderCategory;

  @ApiProperty({
    description: 'Type of health facility',
    enum: HealthFacilityType,
    example: HealthFacilityType.SPECIALIZED_HOSPITAL,
    nullable: true
  })
  @Column({
    type: 'enum',
    enum: HealthFacilityType,
    nullable: true
  })
  facilityType: HealthFacilityType;

  @ApiProperty({
    description: 'Provider name',
    example: 'St. Paul Hospital'
  })
  @Column()
  name: string;

  @ApiProperty({
    description: 'Provider phone number',
    example: '+251911234567'
  })
  @Column()
  phone: string;

  @ApiProperty({
    description: 'Provider address',
    example: 'Addis Ababa, Ethiopia'
  })
  @Column()
  address: string;

  @ApiProperty({
    description: 'License number of the facility',
    example: 'LIC123456'
  })
  @Column()
  licenseNumber: string;

  @ApiProperty({
    description: 'Provider health facility type',
    example: 'HOSPITAL'
  })
  @Column({
    type: 'enum',
    enum: HealthFacilityType
  })
  healthFacilityType: HealthFacilityType;

  @ApiProperty({
    description: 'Provider specialties',
    example: ['Cardiology', 'Neurology']
  })
  @Column('simple-array')
  specialties: string[];

  @ApiProperty({
    description: 'Available services at the facility',
    example: [{
      name: 'General Consultation',
      description: 'Basic medical consultation',
      price: 500,
      isActive: true
    }],
    nullable: true
  })
  @Column({ type: 'jsonb', nullable: true })
  services: Array<{
    name: string;
    description: string;
    price: number;
    isActive: boolean;
  }>;

  @ApiProperty({
    description: 'Provider services',
    example: ['Consultation', 'Surgery']
  })
  @Column('simple-array')
  facilityServices: string[];

  @ApiProperty({
    description: 'Provider active status',
    example: true
  })
  @Column({ default: true })
  active: boolean;

  @ApiProperty({
    description: 'Expiry date of the facility license',
    example: '2025-12-31'
  })
  @Column({ type: 'date' })
  licenseExpiryDate: Date;

  @ApiProperty({
    description: 'Tax identification number',
    example: 'TAX123456',
    nullable: true
  })
  @Column({ nullable: true })
  taxId: string;

  @ApiProperty({
    description: 'Location information including coordinates and address',
    example: {
      latitude: 9.0222,
      longitude: 38.7468,
      address: 'Bole Road, Behind Dembel City Center',
      city: 'Addis Ababa',
      state: 'Addis Ababa',
      country: 'Ethiopia',
      postalCode: '1000'
    }
  })
  @Column({ type: 'jsonb' })
  location: {
    latitude: number;
    longitude: number;
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };

  @ApiProperty({
    description: 'Operating hours for each day of the week',
    example: {
      monday: { open: '09:00', close: '17:00' },
      tuesday: { open: '09:00', close: '17:00' }
    },
    nullable: true
  })
  @Column({ type: 'jsonb', nullable: true })
  operatingHours: {
    monday?: { open: string; close: string };
    tuesday?: { open: string; close: string };
    wednesday?: { open: string; close: string };
    thursday?: { open: string; close: string };
    friday?: { open: string; close: string };
    saturday?: { open: string; close: string };
    sunday?: { open: string; close: string };
  };

  @ApiProperty({
    description: 'Accreditations and certifications',
    example: [{
      name: 'ISO 9001',
      issuedBy: 'ISO',
      issuedDate: '2025-01-01',
      expiryDate: '2026-01-01',
      status: 'Active'
    }],
    nullable: true
  })
  @Column({ type: 'jsonb', nullable: true })
  accreditations: Array<{
    name: string;
    issuedBy: string;
    issuedDate: Date;
    expiryDate: Date;
    status: string;
  }>;

  @ApiProperty({
    description: 'Insurance company ID',
    example: 'INS123456'
  })
  @Column()
  declare insuranceCompanyId: string;

  @OneToOne(() => Admin, { cascade: true })
  @JoinColumn()
  admin: Admin;
}

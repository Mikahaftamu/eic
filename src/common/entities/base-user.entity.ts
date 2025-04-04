import { Column, CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { UserType } from '../enums/user-type.enum';

export abstract class BaseUser {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true, nullable: true, type: 'varchar' })
  email: string | null;

  @Column()
  password: string;

  @Column({ type: 'enum', enum: UserType })
  userType: UserType;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  phoneNumber: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  lastLoginAt: Date;

  @Column({ nullable: true, type: 'uuid' })
  insuranceCompanyId: string | null;

  @ManyToOne('InsuranceCompany', 'members', { lazy: true })
  @JoinColumn({ name: 'insuranceCompanyId' })
  insuranceCompany: any; // We'll use any here to avoid circular dependency

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

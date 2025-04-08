import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseUser } from '../../common/entities/base-user.entity';
import { UserType } from '../../common/enums/user-type.enum';
import { PolicyContract } from '../../policy/entities/policy-contract.entity';

@Entity('members')
export class Member extends BaseUser
{
  constructor()
  {
    super();
    this.userType = UserType.MEMBER;
  }

  @Column({ nullable: true })
  policyNumber: string;

  @Column({ type: 'date', nullable: true })
  dateOfBirth: Date;

  @Column({ nullable: true })
  gender: string;

  @Column({ nullable: true })
  nationalId: string;

  @Column({ type: 'jsonb', nullable: true })
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  dependents: Array<{
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    relationship: string;
    gender: string;
    nationalId?: string;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  medicalHistory: Array<{
    condition: string;
    diagnosedDate: Date;
    medications?: string[];
    notes?: string;
  }>;

  @Column({ nullable: true })
  employerId: string;

  @Column({ type: 'date', nullable: true })
  coverageStartDate: Date;

  @Column({ type: 'date', nullable: true })
  coverageEndDate: Date;

  @Column({ type: 'jsonb', nullable: true })
  benefits: {
    planType: string;
    coverageLevel: string;
    deductible: number;
    copay: number;
    outOfPocketMax: number;
    prescriptionCoverage?: boolean;
    dentalCoverage?: boolean;
    visionCoverage?: boolean;
  };

  @Column({ nullable: true })
  policyContractId: string;

  @ManyToOne(() => PolicyContract, (policyContract) => policyContract.member)
  @JoinColumn({ name: 'policyContractId' })
  policyContract: PolicyContract;

  @OneToMany(() => PolicyContract, (policy) => policy.member)
  policies: PolicyContract[];
}

import { Entity, Column } from 'typeorm';
import { BaseUser } from '../../common/entities/base-user.entity';
import { UserType } from '../../common/enums/user-type.enum';

export enum StaffRole {
  PROVIDER_MANAGEMENT = 'PROVIDER_MANAGEMENT',
  STAFF_MANAGEMENT = 'STAFF_MANAGEMENT',
  MEMBER_MANAGEMENT = 'MEMBER_MANAGEMENT',
  CLAIMS_MANAGEMENT = 'CLAIMS_MANAGEMENT',
  BILLING_MANAGEMENT = 'BILLING_MANAGEMENT',
  REPORTS_MANAGEMENT = 'REPORTS_MANAGEMENT',
  GENERAL_STAFF = 'GENERAL_STAFF'
}

@Entity('staff')
export class Staff extends BaseUser {
  constructor() {
    super();
    this.userType = UserType.STAFF;
  }

  @Column('enum', { enum: StaffRole, array: true, default: [StaffRole.GENERAL_STAFF] })
  roles: StaffRole[];

  @Column({ nullable: true, type: 'varchar' })
  department: string | null;

  @Column({ nullable: true, type: 'varchar' })
  position: string | null;

  @Column()
  employeeId: string;

  @Column({ type: 'jsonb', nullable: true })
  permissions: {
    claims?: {
      view?: boolean;
      process?: boolean;
      approve?: boolean;
      deny?: boolean;
    };
    policies?: {
      view?: boolean;
      create?: boolean;
      modify?: boolean;
      terminate?: boolean;
    };
    members?: {
      view?: boolean;
      create?: boolean;
      modify?: boolean;
      deactivate?: boolean;
    };
    providers?: {
      view?: boolean;
      create?: boolean;
      modify?: boolean;
      deactivate?: boolean;
    };
    reports?: {
      view?: boolean;
      generate?: boolean;
      export?: boolean;
    };
  };

  @Column({ nullable: true })
  supervisorId: string;

  @Column({ type: 'jsonb', nullable: true })
  workAssignments: Array<{
    type: string;
    description: string;
    startDate: Date;
    endDate?: Date;
    status: 'active' | 'completed' | 'cancelled';
  }>;

  @Column({ type: 'jsonb', nullable: true })
  performance: {
    metrics: {
      claimsProcessed?: number;
      averageProcessingTime?: number;
      customerSatisfaction?: number;
      accuracy?: number;
    };
    lastEvaluationDate?: Date;
    evaluationScore?: number;
  };
}

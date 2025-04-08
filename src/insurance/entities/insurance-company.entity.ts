import
{
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('insurance_companies') // Updated to plural
export class InsuranceCompany
{
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  code: string;

  @Column({ unique: true, nullable: true, type: 'varchar' })
  email: string | null;

  @Column()
  phone: string;

  @Column()
  address: string;

  @Column({ nullable: true, type: 'varchar' })
  website: string | null;

  @Column()
  license: string;

  @Column({ nullable: true, type: 'varchar' })
  description: string | null;

  @Column({ type: 'jsonb', default: {} })
  settings: Record<string, any>;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany('Member', (member: any) => member.insuranceCompany)
  members: any[];

  @OneToMany('Provider', (provider: any) => provider.insuranceCompany)
  providers: any[];

  @OneToMany('Staff', (staff: any) => staff.insuranceCompany)
  staff: any[];

  @OneToMany('Admin', (admin: any) => admin.insuranceCompany)
  admins: any[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

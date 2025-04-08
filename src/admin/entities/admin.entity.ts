import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseUser } from '../../common/entities/base-user.entity';
import { AdminType } from '../../common/enums/admin-type.enum';
import { UserType } from '../../common/enums/user-type.enum';
@Entity('admins')
export class Admin extends BaseUser
{
  constructor()
  {
    super();
    this.userType = UserType.ADMIN;  // No conflict because userType is defined in BaseUser
  }

  @Column({
    type: 'enum',
    enum: AdminType,
    default: AdminType.SYSTEM_ADMIN
  })
  adminType: AdminType;

  @Column({ nullable: true, type: 'uuid' })
  corporateClientId: string | null;

  @ManyToOne('CorporateClient', { lazy: true })
  @JoinColumn({ name: 'corporateClientId' })
  corporateClient: any;
}

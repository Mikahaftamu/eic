import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { UserType } from '../../common/enums/user-type.enum';

class AddressDto {
  @ApiProperty()
  street: string;

  @ApiProperty()
  city: string;

  @ApiProperty()
  state: string;

  @ApiProperty()
  country: string;

  @ApiProperty()
  postalCode: string;
}

class DependentDto {
  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  dateOfBirth: Date;

  @ApiProperty()
  relationship: string;

  @ApiProperty()
  gender: string;

  @ApiProperty({ required: false })
  nationalId?: string;
}

class MedicalHistoryDto {
  @ApiProperty()
  condition: string;

  @ApiProperty()
  diagnosedDate: Date;

  @ApiProperty({ required: false, type: [String] })
  medications?: string[];

  @ApiProperty({ required: false })
  notes?: string;
}

class BenefitsDto {
  @ApiProperty()
  planType: string;

  @ApiProperty()
  coverageLevel: string;

  @ApiProperty()
  deductible: number;

  @ApiProperty()
  copay: number;

  @ApiProperty()
  outOfPocketMax: number;

  @ApiProperty({ required: false })
  prescriptionCoverage?: boolean;

  @ApiProperty({ required: false })
  dentalCoverage?: boolean;

  @ApiProperty({ required: false })
  visionCoverage?: boolean;
}

export class MemberResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  username: string;

  @ApiProperty()
  email: string;

  @Exclude()
  password: string;

  @ApiProperty({ enum: UserType })
  userType: UserType;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  phoneNumber: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty({ required: false })
  lastLoginAt?: Date;

  @ApiProperty({ required: false })
  policyNumber?: string;

  @ApiProperty({ required: false })
  dateOfBirth?: Date;

  @ApiProperty({ required: false })
  gender?: string;

  @ApiProperty({ required: false })
  nationalId?: string;

  @ApiProperty({ required: false })
  @Type(() => AddressDto)
  address?: AddressDto;

  @ApiProperty({ required: false, type: [DependentDto] })
  @Type(() => DependentDto)
  dependents?: DependentDto[];

  @ApiProperty({ required: false, type: [MedicalHistoryDto] })
  @Type(() => MedicalHistoryDto)
  medicalHistory?: MedicalHistoryDto[];

  @ApiProperty({ required: false })
  employerId?: string;

  @ApiProperty({ required: false })
  coverageStartDate?: Date;

  @ApiProperty({ required: false })
  coverageEndDate?: Date;

  @ApiProperty({ required: false })
  @Type(() => BenefitsDto)
  benefits?: BenefitsDto;

  @ApiProperty({ required: false })
  policyContractId?: string;

  @ApiProperty()
  insuranceCompanyId: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @Expose()
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}

import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { ClaimItemStatus } from '../entities/claim-item.entity';

export class ClaimItemResponseDto {
  @ApiProperty({ description: 'Unique identifier for the claim item' })
  @Expose()
  id: string;

  @ApiProperty({ description: 'ID of the parent claim' })
  @Expose()
  claimId: string;

  @ApiProperty({ description: 'Service or procedure code' })
  @Expose()
  serviceCode: string;

  @ApiProperty({ description: 'Description of the service or procedure' })
  @Expose()
  serviceDescription: string;

  @ApiProperty({ description: 'Date the service was provided', type: Date })
  @Expose()
  serviceDate: Date;

  @ApiProperty({ description: 'Quantity of the service provided' })
  @Expose()
  quantity: number;

  @ApiProperty({ description: 'Price per unit of service' })
  @Expose()
  unitPrice: number;

  @ApiProperty({ description: 'Total price for this service' })
  @Expose()
  totalPrice: number;

  @ApiProperty({ description: 'Amount approved for payment' })
  @Expose()
  approvedAmount: number;

  @ApiProperty({ description: 'Amount actually paid' })
  @Expose()
  paidAmount: number;

  @ApiProperty({ description: 'Amount the member is responsible for' })
  @Expose()
  memberResponsibility: number;

  @ApiProperty({ description: 'Current status of the claim item', enum: ClaimItemStatus })
  @Expose()
  status: ClaimItemStatus;

  @ApiProperty({ description: 'Reason for denial if applicable', required: false })
  @Expose()
  denialReason?: string;

  @ApiProperty({ description: 'Service code modifiers if applicable', required: false })
  @Expose()
  modifiers?: string;

  @ApiProperty({ description: 'Whether this service is excluded from coverage' })
  @Expose()
  isExcludedService: boolean;

  @ApiProperty({ description: 'Whether this service is preventive care' })
  @Expose()
  isPreventiveCare: boolean;

  @ApiProperty({ description: 'Date the claim item was created', type: Date })
  @Expose()
  createdAt: Date;

  @ApiProperty({ description: 'Date the claim item was last updated', type: Date })
  @Expose()
  updatedAt: Date;
}

import { PartialType } from '@nestjs/swagger';
import { CreatePolicyContractDto } from './create-policy-contract.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ContractStatus } from '../enums/contract-status.enum';
import { PaymentStatus } from '../enums/payment-status.enum';
import { CancellationReason } from '../enums/cancellation-reason.enum';

export class UpdatePolicyContractDto extends PartialType(CreatePolicyContractDto) {
  @ApiProperty({ enum: ContractStatus, required: false })
  @IsOptional()
  @IsEnum(ContractStatus)
  status?: ContractStatus;

  @ApiProperty({ enum: PaymentStatus, required: false })
  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;

  @ApiProperty({ enum: CancellationReason, required: false })
  @IsOptional()
  @IsEnum(CancellationReason)
  cancellationReason?: CancellationReason;
}

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { PolicyContractService } from '../services/policy-contract.service';
import { CreatePolicyContractDto } from '../dto/create-policy-contract.dto';
import { UpdatePolicyContractDto } from '../dto/update-policy-contract.dto';
import { PolicyContract } from '../entities/policy-contract.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserType } from '../../common/enums/user-type.enum';
import { GetUser } from '../../auth/decorators/get-user.decorator';
import { ContractStatus } from '../enums/contract-status.enum';
import { PaymentStatus } from '../enums/payment-status.enum';
import { CancellationReason } from '../enums/cancellation-reason.enum';

@ApiTags('Policy Contracts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('policy-contracts')
export class PolicyContractController {
  constructor(private readonly policyContractService: PolicyContractService) {}

  @Post()
  @Roles(UserType.INSURANCE_STAFF, UserType.ADMIN)
  @ApiOperation({ summary: 'Create a new policy contract' })
  @ApiResponse({
    status: 201,
    description: 'Policy contract created successfully',
    type: PolicyContract,
  })
  @ApiBody({ type: CreatePolicyContractDto })
  create(
    @GetUser('insuranceCompanyId') insuranceCompanyId: string,
    @Body() createDto: CreatePolicyContractDto,
  ): Promise<PolicyContract> {
    return this.policyContractService.create(insuranceCompanyId, createDto);
  }

  @Get()
  @Roles(UserType.INSURANCE_STAFF, UserType.ADMIN)
  @ApiOperation({ summary: 'Get all policy contracts' })
  @ApiResponse({
    status: 200,
    description: 'List of policy contracts',
    type: [PolicyContract],
  })
  findAll(
    @GetUser('insuranceCompanyId') insuranceCompanyId: string,
  ): Promise<PolicyContract[]> {
    return this.policyContractService.findAll(insuranceCompanyId);
  }

  @Get(':id')
  @Roles(UserType.INSURANCE_STAFF, UserType.ADMIN, UserType.MEMBER)
  @ApiOperation({ summary: 'Get a policy contract by ID' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'Policy contract details',
    type: PolicyContract,
  })
  findOne(
    @GetUser('insuranceCompanyId') insuranceCompanyId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<PolicyContract> {
    return this.policyContractService.findOne(insuranceCompanyId, id);
  }

  @Patch(':id')
  @Roles(UserType.INSURANCE_STAFF, UserType.ADMIN)
  @ApiOperation({ summary: 'Update a policy contract' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiBody({ type: UpdatePolicyContractDto })
  @ApiResponse({
    status: 200,
    description: 'Policy contract updated successfully',
    type: PolicyContract,
  })
  update(
    @GetUser('insuranceCompanyId') insuranceCompanyId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdatePolicyContractDto,
  ): Promise<PolicyContract> {
    return this.policyContractService.update(insuranceCompanyId, id, updateDto);
  }

  @Post(':id/cancel')
  @Roles(UserType.INSURANCE_STAFF, UserType.ADMIN)
  @ApiOperation({ summary: 'Cancel a policy contract' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        reason: {
          type: 'string',
          enum: Object.values(CancellationReason),
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Policy contract cancelled successfully',
    type: PolicyContract,
  })
  cancel(
    @GetUser('insuranceCompanyId') insuranceCompanyId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body('reason') reason: CancellationReason,
  ): Promise<PolicyContract> {
    return this.policyContractService.cancel(insuranceCompanyId, id, reason);
  }

  @Post(':id/renew')
  @Roles(UserType.INSURANCE_STAFF, UserType.ADMIN)
  @ApiOperation({ summary: 'Renew a policy contract' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'Policy contract renewed successfully',
    type: PolicyContract,
  })
  renew(
    @GetUser('insuranceCompanyId') insuranceCompanyId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<PolicyContract> {
    return this.policyContractService.renew(insuranceCompanyId, id);
  }

  @Post(':id/payment-status')
  @Roles(UserType.INSURANCE_STAFF, UserType.ADMIN)
  @ApiOperation({ summary: 'Update payment status of a policy contract' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['status', 'amount', 'transactionId', 'method'],
      properties: {
        status: {
          type: 'string',
          enum: Object.values(PaymentStatus),
        },
        amount: {
          type: 'number',
          minimum: 0,
        },
        transactionId: {
          type: 'string',
        },
        method: {
          type: 'string',
          example: 'CREDIT_CARD',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Payment status updated successfully',
    type: PolicyContract,
  })
  updatePaymentStatus(
    @GetUser('insuranceCompanyId') insuranceCompanyId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: PaymentStatus,
    @Body() paymentDetails: {
      amount: number;
      transactionId: string;
      method: string;
    },
  ): Promise<PolicyContract> {
    return this.policyContractService.updatePaymentStatus(
      insuranceCompanyId,
      id,
      status,
      paymentDetails,
    );
  }
}

import { Controller, Get, Post, Body, Param, Delete, Query, Patch, UseGuards, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiBody } from '@nestjs/swagger';
import { PaymentPlanService } from '../services/payment-plan.service';
import { CreatePaymentPlanDto } from '../dto/create-payment-plan.dto';
import { PaymentPlanResponseDto } from '../dto/payment-plan-response.dto';
import { PaymentPlanStatus } from '../entities/payment-plan.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserType } from '../../common/enums/user-type.enum';

@ApiTags('payment-plans')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('payment-plans')
export class PaymentPlanController {
  constructor(private readonly paymentPlanService: PaymentPlanService) {}

  @Post()
  @Roles(UserType.ADMIN, UserType.INSURANCE_ADMIN, UserType.STAFF)
  @ApiOperation({ summary: 'Create a new payment plan' })
  @ApiResponse({ status: 201, description: 'Payment plan created successfully', type: PaymentPlanResponseDto })
  async create(@Body() createPaymentPlanDto: CreatePaymentPlanDto): Promise<PaymentPlanResponseDto> {
    const paymentPlan = await this.paymentPlanService.create(createPaymentPlanDto);
    return this.paymentPlanService.toResponseDto(paymentPlan);
  }

  @Get()
  @Roles(UserType.ADMIN, UserType.INSURANCE_ADMIN, UserType.STAFF, UserType.MEMBER)
  @ApiOperation({ summary: 'Get all payment plans with optional filtering' })
  @ApiResponse({ status: 200, description: 'List of payment plans', type: [PaymentPlanResponseDto] })
  @ApiQuery({ name: 'status', required: false, enum: PaymentPlanStatus })
  @ApiQuery({ name: 'invoiceId', required: false })
  @ApiQuery({ name: 'memberId', required: false })
  @ApiQuery({ name: 'corporateClientId', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(
    @Query('insuranceCompanyId') insuranceCompanyId: string,
    @Query('status') status?: PaymentPlanStatus,
    @Query('invoiceId') invoiceId?: string,
    @Query('memberId') memberId?: string,
    @Query('corporateClientId') corporateClientId?: string,
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<{ data: PaymentPlanResponseDto[]; total: number; page: number; limit: number }> {
    const { data, total } = await this.paymentPlanService.findAll(
      insuranceCompanyId,
      {
        status,
        invoiceId,
        memberId,
        corporateClientId,
        startDate,
        endDate,
        page: page ? +page : 1,
        limit: limit ? +limit : 10,
      },
    );

    const responseDtos = await Promise.all(
      data.map(plan => this.paymentPlanService.toResponseDto(plan))
    );

    return {
      data: responseDtos,
      total,
      page: page ? +page : 1,
      limit: limit ? +limit : 10,
    };
  }

  @Get(':id')
  @Roles(UserType.ADMIN, UserType.INSURANCE_ADMIN, UserType.STAFF, UserType.MEMBER)
  @ApiOperation({ summary: 'Get a payment plan by ID' })
  @ApiResponse({ status: 200, description: 'Payment plan details', type: PaymentPlanResponseDto })
  async findOne(@Param('id') id: string): Promise<PaymentPlanResponseDto> {
    const paymentPlan = await this.paymentPlanService.findOne(id);
    return this.paymentPlanService.toResponseDto(paymentPlan);
  }

  @Get('plan-number/:planNumber')
  @Roles(UserType.ADMIN, UserType.INSURANCE_ADMIN, UserType.STAFF, UserType.MEMBER)
  @ApiOperation({ summary: 'Get a payment plan by plan number' })
  @ApiResponse({ status: 200, description: 'Payment plan details', type: PaymentPlanResponseDto })
  async findByPlanNumber(@Param('planNumber') planNumber: string): Promise<PaymentPlanResponseDto> {
    const paymentPlan = await this.paymentPlanService.findByPlanNumber(planNumber);
    return this.paymentPlanService.toResponseDto(paymentPlan);
  }

  @Patch(':id/status')
  @Roles(UserType.ADMIN, UserType.INSURANCE_ADMIN, UserType.STAFF)
  @ApiOperation({ summary: 'Update payment plan status' })
  @ApiResponse({ status: 200, description: 'Payment plan status updated', type: PaymentPlanResponseDto })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['status'],
      properties: {
        status: {
          type: 'string',
          enum: Object.values(PaymentPlanStatus),
          description: 'New status for the payment plan',
          example: 'completed'
        }
      }
    }
  })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ): Promise<PaymentPlanResponseDto> {
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      throw new BadRequestException(`Invalid UUID format: ${id}`);
    }
    
    // Validate status value
    if (!status) {
      throw new BadRequestException('Status is required');
    }
    
    // Check if status is a valid enum value
    const validStatuses = Object.values(PaymentPlanStatus);
    if (!validStatuses.includes(status as PaymentPlanStatus)) {
      throw new BadRequestException(
        `Invalid status value: ${status}. Valid values are: ${validStatuses.join(', ')}`
      );
    }
    
    const paymentPlan = await this.paymentPlanService.updateStatus(id, status as PaymentPlanStatus);
    return this.paymentPlanService.toResponseDto(paymentPlan);
  }

  @Post(':id/payment')
  @Roles(UserType.ADMIN, UserType.INSURANCE_ADMIN, UserType.STAFF)
  @ApiOperation({ summary: 'Record a payment for a payment plan' })
  @ApiResponse({ status: 200, description: 'Payment recorded', type: PaymentPlanResponseDto })
  async recordPayment(
    @Param('id') id: string,
    @Body('amount') amount: number,
  ): Promise<PaymentPlanResponseDto> {
    const paymentPlan = await this.paymentPlanService.recordPayment(id, amount);
    return this.paymentPlanService.toResponseDto(paymentPlan);
  }

  @Post(':id/reminder')
  @Roles(UserType.ADMIN, UserType.INSURANCE_ADMIN, UserType.STAFF)
  @ApiOperation({ summary: 'Send a reminder for a payment plan' })
  @ApiResponse({ status: 200, description: 'Reminder sent', type: PaymentPlanResponseDto })
  async sendReminder(@Param('id') id: string): Promise<PaymentPlanResponseDto> {
    const paymentPlan = await this.paymentPlanService.sendReminder(id);
    return this.paymentPlanService.toResponseDto(paymentPlan);
  }

  @Delete(':id')
  @Roles(UserType.ADMIN, UserType.INSURANCE_ADMIN, UserType.STAFF)
  @ApiOperation({ summary: 'Delete a payment plan' })
  @ApiResponse({ status: 204, description: 'Payment plan deleted' })
  async delete(@Param('id') id: string): Promise<void> {
    await this.paymentPlanService.delete(id);
  }
}

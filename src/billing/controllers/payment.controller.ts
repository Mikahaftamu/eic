import { Controller, Get, Post, Body, Param, Delete, Query, Patch, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PaymentService } from '../services/payment.service';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { PaymentResponseDto } from '../dto/payment-response.dto';
import { UpdatePaymentStatusDto } from '../dto/update-payment-status.dto';
import { ProcessRefundDto } from '../dto/process-refund.dto';
import { PaymentStatus, PaymentType } from '../entities/payment.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserType } from '../../common/enums/user-type.enum';

@ApiTags('payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  @Roles(UserType.ADMIN, UserType.INSURANCE_ADMIN, UserType.STAFF)
  @ApiOperation({ summary: 'Create a new payment' })
  @ApiResponse({ status: 201, description: 'Payment created successfully', type: PaymentResponseDto })
  async create(@Body() createPaymentDto: CreatePaymentDto): Promise<PaymentResponseDto> {
    const payment = await this.paymentService.create(createPaymentDto);
    return this.paymentService.toResponseDto(payment);
  }

  @Get()
  @Roles(UserType.ADMIN, UserType.INSURANCE_ADMIN, UserType.STAFF, UserType.MEMBER)
  @ApiOperation({ summary: 'Get all payments with optional filtering' })
  @ApiResponse({ status: 200, description: 'List of payments', type: [PaymentResponseDto] })
  @ApiQuery({ name: 'status', required: false, enum: PaymentStatus })
  @ApiQuery({ name: 'type', required: false, enum: PaymentType })
  @ApiQuery({ name: 'memberId', required: false })
  @ApiQuery({ name: 'invoiceId', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(
    @Query('insuranceCompanyId') insuranceCompanyId: string,
    @Query('status') status?: PaymentStatus,
    @Query('type') type?: PaymentType,
    @Query('memberId') memberId?: string,
    @Query('invoiceId') invoiceId?: string,
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<{ data: PaymentResponseDto[]; total: number; page: number; limit: number }> {
    const { data, total } = await this.paymentService.findAll(
      insuranceCompanyId,
      status,
      type,
      memberId,
      invoiceId,
      startDate,
      endDate,
      page,
      limit,
    );

    const responseDtos = await Promise.all(
      data.map(payment => this.paymentService.toResponseDto(payment))
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
  @ApiOperation({ summary: 'Get a payment by ID' })
  @ApiResponse({ status: 200, description: 'Payment details', type: PaymentResponseDto })
  async findOne(@Param('id') id: string): Promise<PaymentResponseDto> {
    const payment = await this.paymentService.findOne(id);
    return this.paymentService.toResponseDto(payment);
  }

  @Get('transaction-id/:transactionId')
  @Roles(UserType.ADMIN, UserType.INSURANCE_ADMIN, UserType.STAFF, UserType.MEMBER)
  @ApiOperation({ summary: 'Get a payment by transaction ID' })
  @ApiResponse({ status: 200, description: 'Payment details', type: PaymentResponseDto })
  async findByTransactionId(@Param('transactionId') transactionId: string): Promise<PaymentResponseDto> {
    const payment = await this.paymentService.findByTransactionId(transactionId);
    return this.paymentService.toResponseDto(payment);
  }

  @Patch(':id/status')
  @Roles(UserType.ADMIN, UserType.INSURANCE_ADMIN, UserType.STAFF)
  @ApiOperation({ summary: 'Update payment status' })
  @ApiResponse({ status: 200, description: 'Payment status updated', type: PaymentResponseDto })
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdatePaymentStatusDto,
  ): Promise<PaymentResponseDto> {
    const payment = await this.paymentService.updateStatus(id, updateStatusDto);
    return this.paymentService.toResponseDto(payment);
  }

  @Post(':id/refund')
  @Roles(UserType.ADMIN, UserType.INSURANCE_ADMIN, UserType.STAFF)
  @ApiOperation({ summary: 'Process a refund for a payment' })
  @ApiResponse({ status: 200, description: 'Refund processed', type: PaymentResponseDto })
  async processRefund(
    @Param('id') id: string,
    @Body() refundDto: ProcessRefundDto,
  ): Promise<PaymentResponseDto> {
    const payment = await this.paymentService.processRefund(id, refundDto);
    return this.paymentService.toResponseDto(payment);
  }

  @Delete(':id')
  @Roles(UserType.ADMIN, UserType.INSURANCE_ADMIN)
  @ApiOperation({ summary: 'Delete a payment' })
  @ApiResponse({ status: 204, description: 'Payment deleted' })
  async delete(@Param('id') id: string): Promise<void> {
    await this.paymentService.delete(id);
  }
}
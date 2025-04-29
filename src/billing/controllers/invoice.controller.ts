import { Controller, Get, Post, Body, Param, Delete, Query, Patch, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { InvoiceService } from '../services/invoice.service';
import { CreateInvoiceDto } from '../dto/create-invoice.dto';
import { InvoiceResponseDto } from '../dto/invoice-response.dto';
import { InvoiceStatus, InvoiceType } from '../entities/invoice.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserType } from '../../common/enums/user-type.enum';
import { InvoiceStats } from '../entities/invoice-stats.entity';

@ApiTags('invoices')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('invoices')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Post()
  @Roles(UserType.ADMIN, UserType.INSURANCE_ADMIN, UserType.STAFF)
  @ApiOperation({ summary: 'Create a new invoice' })
  @ApiResponse({ status: 201, description: 'Invoice created successfully', type: InvoiceResponseDto })
  async create(@Body() createInvoiceDto: CreateInvoiceDto): Promise<InvoiceResponseDto> {
    const invoice = await this.invoiceService.create(createInvoiceDto);
    return this.invoiceService.toResponseDto(invoice);
  }

  @Get()
  @Roles(UserType.ADMIN, UserType.INSURANCE_ADMIN, UserType.STAFF, UserType.MEMBER)
  @ApiOperation({ summary: 'Get all invoices with optional filtering' })
  @ApiResponse({ status: 200, description: 'List of invoices', type: [InvoiceResponseDto] })
  @ApiQuery({ name: 'status', required: false, enum: InvoiceStatus })
  @ApiQuery({ name: 'type', required: false, enum: InvoiceType })
  @ApiQuery({ name: 'memberId', required: false })
  @ApiQuery({ name: 'corporateClientId', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(
    @Query('insuranceCompanyId') insuranceCompanyId: string,
    @Query('status') status?: InvoiceStatus,
    @Query('type') type?: InvoiceType,
    @Query('memberId') memberId?: string,
    @Query('corporateClientId') corporateClientId?: string,
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<{ data: InvoiceResponseDto[]; total: number; page: number; limit: number }> {
    const { data, total } = await this.invoiceService.findAll(
      insuranceCompanyId,
      status,
      type,
      memberId,
      corporateClientId,
      startDate,
      endDate,
      page,
      limit
    );

    const responseDtos = await Promise.all(
      data.map(invoice => this.invoiceService.toResponseDto(invoice))
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
  @ApiOperation({ summary: 'Get an invoice by ID' })
  @ApiResponse({ status: 200, description: 'Invoice details', type: InvoiceResponseDto })
  async findOne(@Param('id') id: string): Promise<InvoiceResponseDto> {
    const invoice = await this.invoiceService.findOne(id);
    return this.invoiceService.toResponseDto(invoice);
  }

  @Get('invoice-number/:invoiceNumber')
  @Roles(UserType.ADMIN, UserType.INSURANCE_ADMIN, UserType.STAFF, UserType.MEMBER)
  @ApiOperation({ summary: 'Get an invoice by invoice number' })
  @ApiResponse({ status: 200, description: 'Invoice details', type: InvoiceResponseDto })
  async findByInvoiceNumber(@Param('invoiceNumber') invoiceNumber: string): Promise<InvoiceResponseDto> {
    const invoice = await this.invoiceService.findByInvoiceNumber(invoiceNumber);
    return this.invoiceService.toResponseDto(invoice);
  }

  @Patch(':id/status')
  @Roles(UserType.ADMIN, UserType.INSURANCE_ADMIN, UserType.STAFF)
  @ApiOperation({ summary: 'Update invoice status' })
  @ApiResponse({ status: 200, description: 'Invoice status updated', type: InvoiceResponseDto })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: InvoiceStatus,
  ): Promise<InvoiceResponseDto> {
    const invoice = await this.invoiceService.updateStatus(id, status);
    return this.invoiceService.toResponseDto(invoice);
  }

  @Delete(':id')
  @Roles(UserType.ADMIN, UserType.INSURANCE_ADMIN)
  @ApiOperation({ summary: 'Delete an invoice' })
  @ApiResponse({ status: 204, description: 'Invoice deleted' })
  async delete(@Param('id') id: string): Promise<void> {
    await this.invoiceService.delete(id);
  }

  @Get('stats/monthly')
  @Roles(UserType.ADMIN, UserType.INSURANCE_ADMIN, UserType.STAFF)
  @ApiOperation({ summary: 'Get monthly invoice statistics' })
  @ApiResponse({ status: 200, description: 'Monthly invoice statistics' })
  async getMonthlyStats(
    @Query('insuranceCompanyId') insuranceCompanyId: string,
    @Query('month') month: number,
    @Query('year') year: number,
  ): Promise<InvoiceStats> {
    return this.invoiceService.getMonthlyInvoiceStats(
      insuranceCompanyId,
      month,
      year,
    );
  }
}
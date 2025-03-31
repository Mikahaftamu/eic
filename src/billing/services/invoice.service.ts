import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, FindManyOptions, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Invoice, InvoiceStatus, InvoiceType } from '../entities/invoice.entity';
import { InvoiceItem } from '../entities/invoice-item.entity';
import { CreateInvoiceDto } from '../dto/create-invoice.dto';
import { InvoiceResponseDto } from '../dto/invoice-response.dto';
import { InvoiceItemResponseDto } from '../dto/invoice-item-response.dto';
import { PolicyContractService } from '../../policy/services/policy-contract.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class InvoiceService {
  constructor(
    @InjectRepository(Invoice)
    private invoiceRepository: Repository<Invoice>,
    @InjectRepository(InvoiceItem)
    private invoiceItemRepository: Repository<InvoiceItem>,
    private policyContractService: PolicyContractService,
  ) {}

  async create(createInvoiceDto: CreateInvoiceDto): Promise<Invoice> {
    // Validate insurance company exists
    // const insuranceCompany = await this.insuranceCompanyService.findOne(
    //   createInvoiceDto.insuranceCompanyId,
    // );

    // Validate member if provided
    // if (createInvoiceDto.memberId) {
    //   await this.memberService.findOne(createInvoiceDto.memberId);
    // }

    // Validate corporate client if provided
    // if (createInvoiceDto.corporateClientId) {
    //   await this.corporateClientService.findOne(createInvoiceDto.corporateClientId);
    // }

    // Validate policy contract if provided
    if (createInvoiceDto.policyContractId) {
      // Validate policy contract exists
      await this.policyContractService.findOne(createInvoiceDto.policyContractId, createInvoiceDto.insuranceCompanyId);
    }

    // Generate invoice number
    const invoiceNumber = await this.generateInvoiceNumber(
      // insuranceCompany.code,
      createInvoiceDto.type,
    );

    // Create invoice entity
    const invoice = this.invoiceRepository.create({
      invoiceNumber,
      type: createInvoiceDto.type,
      status: InvoiceStatus.DRAFT,
      issueDate: createInvoiceDto.issueDate,
      dueDate: createInvoiceDto.dueDate,
      notes: createInvoiceDto.notes,
      paymentTerms: createInvoiceDto.paymentTerms,
      billingAddress: createInvoiceDto.billingAddress,
      // insuranceCompanyId: createInvoiceDto.insuranceCompanyId,
      // memberId: createInvoiceDto.memberId,
      // corporateClientId: createInvoiceDto.corporateClientId,
      policyContractId: createInvoiceDto.policyContractId,
      isRecurring: createInvoiceDto.isRecurring || false,
      recurringFrequency: createInvoiceDto.recurringFrequency,
      nextRecurringDate: createInvoiceDto.nextRecurringDate,
    });

    // Calculate totals
    let subtotal = 0;
    let totalTax = 0;
    let totalDiscount = 0;

    // Create invoice items
    const invoiceItems = createInvoiceDto.items.map((itemDto) => {
      const quantity = itemDto.quantity || 1;
      const discount = itemDto.discount || 0;
      const tax = itemDto.tax || 0;
      const itemTotal = quantity * itemDto.unitPrice - discount + tax;

      subtotal += quantity * itemDto.unitPrice;
      totalTax += tax;
      totalDiscount += discount;

      return this.invoiceItemRepository.create({
        description: itemDto.description,
        unitPrice: itemDto.unitPrice,
        quantity,
        discount,
        tax,
        total: itemTotal,
        periodStart: itemDto.periodStart,
        periodEnd: itemDto.periodEnd,
        itemType: itemDto.itemType,
        notes: itemDto.notes,
      });
    });

    // Set invoice totals
    invoice.subtotal = subtotal;
    invoice.tax = totalTax;
    invoice.discount = totalDiscount;
    invoice.total = subtotal - totalDiscount + totalTax;
    invoice.amountDue = invoice.total;

    // Save invoice
    const savedInvoice = await this.invoiceRepository.save(invoice);

    // Save invoice items with the invoice ID
    await Promise.all(
      invoiceItems.map((item) => {
        item.invoiceId = savedInvoice.id;
        return this.invoiceItemRepository.save(item);
      }),
    );

    // Fetch the complete invoice with items
    return this.findOne(savedInvoice.id);
  }

  async findAll(
    insuranceCompanyId: string,
    status?: InvoiceStatus,
    type?: InvoiceType,
    memberId?: string,
    corporateClientId?: string,
    startDate?: Date,
    endDate?: Date,
    page = 1,
    limit = 10,
  ): Promise<{ data: Invoice[]; total: number }> {
    const where: FindOptionsWhere<Invoice> = { insuranceCompanyId };

    if (status) {
      where.status = status;
    }

    if (type) {
      where.type = type;
    }

    if (memberId) {
      where.memberId = memberId;
    }

    if (corporateClientId) {
      where.corporateClientId = corporateClientId;
    }

    if (startDate && endDate) {
      where.issueDate = Between(startDate, endDate);
    }

    const [data, total] = await this.invoiceRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['items', 'member', 'corporateClient', 'insuranceCompany', 'policyContract'],
    });

    return { data, total };
  }

  async findOne(id: string): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findOne({
      where: { id },
      relations: ['items', 'payments'],
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }

    return invoice;
  }

  async findByInvoiceNumber(invoiceNumber: string): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findOne({
      where: { invoiceNumber },
      relations: ['items', 'payments'],
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice with number ${invoiceNumber} not found`);
    }

    return invoice;
  }

  async update(
    id: string,
    updateData: Partial<Invoice>,
  ): Promise<Invoice> {
    const invoice = await this.findOne(id);

    // Prevent updating certain fields if invoice is already paid
    if (
      (invoice.status === InvoiceStatus.PAID || 
       invoice.status === InvoiceStatus.PARTIALLY_PAID) && 
      (updateData.total || updateData.subtotal || updateData.tax || updateData.discount)
    ) {
      throw new BadRequestException('Cannot update amounts for paid or partially paid invoices');
    }

    // Update invoice
    Object.assign(invoice, updateData);

    // If status is being updated to PAID, set the paid date
    if (updateData.status === InvoiceStatus.PAID && !invoice.paidDate) {
      invoice.paidDate = new Date();
    }

    return this.invoiceRepository.save(invoice);
  }

  async updateStatus(id: string, status: InvoiceStatus): Promise<Invoice> {
    const invoice = await this.findOne(id);
    
    invoice.status = status;
    
    // If status is PAID, set the paidDate
    if (status === InvoiceStatus.PAID) {
      invoice.paidDate = new Date();
    } else if (status === InvoiceStatus.PARTIALLY_PAID) {
      // Keep the paidDate if it exists for partially paid invoices
    } else {
      // For other statuses, clear the paidDate
      invoice.paidDate = undefined;
    }
    
    return this.invoiceRepository.save(invoice);
  }

  async delete(id: string): Promise<void> {
    const invoice = await this.findOne(id);

    // Prevent deleting invoices with payments
    if (invoice.payments && invoice.payments.length > 0) {
      throw new BadRequestException('Cannot delete invoice with associated payments');
    }

    await this.invoiceRepository.remove(invoice);
  }

  async sendReminder(id: string): Promise<Invoice> {
    const invoice = await this.findOne(id);

    // Only send reminders for overdue or pending invoices
    if (invoice.status !== InvoiceStatus.OVERDUE && invoice.status !== InvoiceStatus.PENDING) {
      throw new BadRequestException(`Cannot send reminder for invoice with status ${invoice.status}`);
    }

    // Update reminder fields
    invoice.reminderSent = true;
    invoice.lastReminderDate = new Date();
    invoice.reminderCount += 1;

    // TODO: Implement actual reminder sending logic (email, SMS, etc.)

    return this.invoiceRepository.save(invoice);
  }

  async toResponseDto(invoice: Invoice): Promise<InvoiceResponseDto> {
    const responseDto = new InvoiceResponseDto();
    
    // Map basic properties
    Object.assign(responseDto, {
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      type: invoice.type,
      status: invoice.status,
      issueDate: invoice.issueDate,
      dueDate: invoice.dueDate,
      paidDate: invoice.paidDate,
      subtotal: invoice.subtotal,
      taxAmount: invoice.taxAmount,
      discountAmount: invoice.discountAmount,
      total: invoice.total,
      amountPaid: invoice.amountPaid,
      amountDue: invoice.amountDue,
      notes: invoice.notes,
      paymentTerms: invoice.paymentTerms,
      billingAddress: invoice.billingAddress,
      insuranceCompanyId: invoice.insuranceCompanyId,
      memberId: invoice.memberId,
      corporateClientId: invoice.corporateClientId,
      policyContractId: invoice.policyContractId,
      isRecurring: invoice.isRecurring,
      recurringFrequency: invoice.recurringFrequency,
      nextRecurringDate: invoice.nextRecurringDate,
      createdAt: invoice.createdAt,
      updatedAt: invoice.updatedAt,
    });

    // Map invoice items
    if (invoice.items && invoice.items.length > 0) {
      responseDto.items = await Promise.all(
        invoice.items.map(item => this.mapInvoiceItemToDto(item))
      );
    } else {
      responseDto.items = [];
    }

    // Map related entities if loaded
    if (invoice.insuranceCompany) {
      responseDto.insuranceCompanyName = invoice.insuranceCompany.name;
    }

    if (invoice.member) {
      responseDto.memberName = `${invoice.member.firstName} ${invoice.member.lastName}`;
    }

    if (invoice.corporateClient) {
      responseDto.corporateClientName = invoice.corporateClient.name;
    }

    if (invoice.policyContract) {
      responseDto.policyNumber = invoice.policyContract.policyNumber;
    }

    return responseDto;
  }

  private async mapInvoiceItemToDto(item: InvoiceItem): Promise<InvoiceItemResponseDto> {
    const dto = new InvoiceItemResponseDto();
    
    Object.assign(dto, {
      id: item.id,
      invoiceId: item.invoiceId,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      discount: item.discount,
      tax: item.tax,
      total: item.total,
      serviceDate: item.serviceDate,
      serviceCode: item.serviceCode,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    });
    
    return dto;
  }

  async getInvoicesByType(
    insuranceCompanyId: string,
    type: InvoiceType,
    startDate: Date,
    endDate: Date,
  ): Promise<Invoice[]> {
    let query: FindOptionsWhere<Invoice> = {
      insuranceCompanyId,
      type,
    };

    if (startDate && endDate) {
      query = {
        ...query,
        issueDate: Between(startDate, endDate),
      };
    }

    return this.invoiceRepository.find({
      where: query,
      order: { issueDate: 'DESC' },
    });
  }

  async getInvoiceCountByType(insuranceCompanyId: string): Promise<Record<string, number>> {
    const counts: Record<string, number> = {};

    // Get counts for each invoice type
    for (const type of Object.values(InvoiceType)) {
      const count = await this.invoiceRepository.count({
        where: { insuranceCompanyId, type },
      });
      counts[type] = count;
    }

    return counts;
  }

  async getInvoicesByDateRange(
    insuranceCompanyId: string,
    type: InvoiceType,
    startDate: Date,
    endDate: Date,
  ): Promise<{ count: number; total: number }> {
    const invoices = await this.invoiceRepository.find({
      where: {
        insuranceCompanyId,
        type,
        issueDate: Between(startDate, endDate),
      },
    });

    const count = invoices.length;
    const total = invoices.reduce((acc, invoice) => acc + invoice.total, 0);

    return { count, total };
  }

  async getInvoiceStatsByDateRange(
    insuranceCompanyId: string,
    type: InvoiceType,
    startDate: Date,
    endDate: Date,
  ): Promise<{ count: number; total: number; paid: number; outstanding: number }> {
    const invoices = await this.invoiceRepository.find({
      where: {
        insuranceCompanyId,
        type,
        issueDate: Between(startDate, endDate),
      },
    });

    const count = invoices.length;
    const total = invoices.reduce((acc, invoice) => acc + invoice.total, 0);
    const paid = invoices.reduce((acc, invoice) => acc + (invoice.status === InvoiceStatus.PAID ? invoice.total : 0), 0);
    const outstanding = total - paid;

    return { count, total, paid, outstanding };
  }

  async getMonthlyInvoiceStats(
    insuranceCompanyId: string,
    type: InvoiceType,
    year: number,
    month: number,
  ): Promise<{ count: number; total: number; paid: number; outstanding: number }> {
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0);

    const invoices = await this.invoiceRepository.find({
      where: {
        insuranceCompanyId,
        type,
        issueDate: Between(startOfMonth, LessThanOrEqual(endOfMonth)),
      },
    });

    const count = invoices.length;
    const total = invoices.reduce((acc, invoice) => acc + invoice.total, 0);
    const paid = invoices.reduce((acc, invoice) => acc + (invoice.status === InvoiceStatus.PAID ? invoice.total : 0), 0);
    const outstanding = total - paid;

    return { count, total, paid, outstanding };
  }

  async getRevenueByMonth(
    insuranceCompanyId: string,
    year: number,
  ): Promise<{ month: number; revenue: number }[]> {
    const result: { month: number; revenue: number }[] = [];

    for (let month = 1; month <= 12; month++) {
      const startOfMonth = new Date(year, month - 1, 1);
      const endOfMonth = new Date(year, month, 0);

      const invoices = await this.invoiceRepository.find({
        where: {
          insuranceCompanyId,
          type: InvoiceType.PREMIUM,
          issueDate: Between(startOfMonth, LessThanOrEqual(endOfMonth)),
        },
      });

      const revenue = invoices.reduce(
        (acc, invoice) => acc + (invoice.status === InvoiceStatus.PAID ? invoice.total : 0),
        0,
      );

      result.push({ month, revenue });
    }

    return result;
  }

  async getInvoicesByMonth(
    insuranceCompanyId: string,
    year: number,
  ): Promise<{ month: number; count: number }[]> {
    const result: { month: number; count: number }[] = [];

    for (let month = 1; month <= 12; month++) {
      const startOfMonth = new Date(year, month - 1, 1);
      const endOfMonth = new Date(year, month, 0);

      const count = await this.invoiceRepository.count({
        where: {
          insuranceCompanyId,
          issueDate: Between(startOfMonth, LessThanOrEqual(endOfMonth)),
        },
      });

      result.push({ month, count });
    }

    return result;
  }

  private async generateInvoiceNumber(
    // companyCode: string,
    invoiceType: InvoiceType,
  ): Promise<string> {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    
    // Get type prefix
    let typePrefix = '';
    switch (invoiceType) {
      case InvoiceType.PREMIUM:
        typePrefix = 'P';
        break;
      case InvoiceType.CLAIM:
        typePrefix = 'C';
        break;
      case InvoiceType.REFUND:
        typePrefix = 'R';
        break;
      case InvoiceType.FEE:
        typePrefix = 'F';
        break;
      default:
        typePrefix = 'O';
    }

    // Get count of invoices for this month and type
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    const count = await this.invoiceRepository.count({
      where: {
        type: invoiceType,
        createdAt: Between(startOfMonth, endOfMonth),
      },
    });

    // Generate sequential number
    const sequence = (count + 1).toString().padStart(4, '0');

    // Format: TYPE-YYMM-SEQUENCE
    return `${typePrefix}${year}${month}-${sequence}`;
  }
}
import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, FindManyOptions, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Invoice, InvoiceStatus, InvoiceType } from '../entities/invoice.entity';
import { InvoiceItem } from '../entities/invoice-item.entity';
import { CreateInvoiceDto } from '../dto/create-invoice.dto';
import { InvoiceResponseDto } from '../dto/invoice-response.dto';
import { InvoiceItemResponseDto } from '../dto/invoice-item-response.dto';
import { PolicyContractService } from '../../policy/services/policy-contract.service';
import { InsuranceCompany } from '../../insurance/entities/insurance-company.entity';
import { v4 as uuidv4 } from 'uuid';
import { InvoiceStats } from '../entities/invoice-stats.entity';
import { Payment, PaymentStatus } from '../entities/payment.entity';
import { InsuranceCompanyService } from '../../insurance/services/insurance-company.service';
import { UpdateInvoiceStatusDto } from '../dto/update-invoice-status.dto';

@Injectable()
export class InvoiceService {
  private readonly logger = new Logger(InvoiceService.name);

  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
    @InjectRepository(InvoiceItem)
    private readonly invoiceItemRepository: Repository<InvoiceItem>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(InsuranceCompany)
    private readonly insuranceCompanyRepository: Repository<InsuranceCompany>,
    private readonly policyContractService: PolicyContractService,
    private readonly insuranceCompanyService: InsuranceCompanyService,
  ) {}

  async create(createInvoiceDto: CreateInvoiceDto): Promise<Invoice> {
    // Validate insurance company exists
    const insuranceCompany = await this.insuranceCompanyRepository.findOne({
      where: { id: createInvoiceDto.insuranceCompanyId }
    });
    
    if (!insuranceCompany) {
      throw new NotFoundException(`Insurance company with ID ${createInvoiceDto.insuranceCompanyId} not found`);
    }

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
      try {
        // First try with the provided IDs
        const policyContract = await this.policyContractService.findOne(createInvoiceDto.policyContractId, createInvoiceDto.insuranceCompanyId);
        
        // Use the insurance company ID from the policy contract to ensure consistency
        createInvoiceDto.insuranceCompanyId = policyContract.insuranceCompanyId;
      } catch (error) {
        if (error instanceof NotFoundException) {
          // If not found, try swapping the IDs (in case they were provided in the wrong order)
          try {
            const policyContract = await this.policyContractService.findOne(createInvoiceDto.insuranceCompanyId, createInvoiceDto.policyContractId);
            // If found, update the DTO with the correct IDs
            createInvoiceDto.policyContractId = policyContract.id;
            createInvoiceDto.insuranceCompanyId = policyContract.insuranceCompanyId;
          } catch (swapError) {
            // If still not found, rethrow the original error
            throw error;
          }
        } else {
          throw error;
        }
      }
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
      insuranceCompanyId: createInvoiceDto.insuranceCompanyId,
      memberId: createInvoiceDto.memberId,
      corporateClientId: createInvoiceDto.corporateClientId,
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

  async updateStatus(id: string, updateStatusDto: UpdateInvoiceStatusDto): Promise<Invoice> {
    const invoice = await this.findOne(id);
    const oldStatus = invoice.status;
    
    // Update status
    invoice.status = updateStatusDto.status;

    // Update additional fields if provided
    if (updateStatusDto.amountPaid !== undefined) {
      invoice.amountPaid = updateStatusDto.amountPaid;
      invoice.amountDue = invoice.total - updateStatusDto.amountPaid;
    }

    if (updateStatusDto.paidDate) {
      invoice.paidDate = updateStatusDto.paidDate;
    }

    if (updateStatusDto.dueDate) {
      invoice.dueDate = updateStatusDto.dueDate;
    }

    if (updateStatusDto.notes) {
      invoice.notes = updateStatusDto.notes;
    }

    if (updateStatusDto.reason) {
      invoice.notes = `${invoice.notes ? invoice.notes + '\n' : ''}Status change reason: ${updateStatusDto.reason}`;
    }

    if (updateStatusDto.paymentReference) {
      invoice.paymentReference = updateStatusDto.paymentReference;
    }

    // Validate status transition
    this.validateStatusTransition(oldStatus, updateStatusDto.status);

    // Additional status-specific logic
    if (updateStatusDto.status === InvoiceStatus.PAID && oldStatus !== InvoiceStatus.PAID) {
      if (!invoice.paidDate) {
        invoice.paidDate = new Date();
      }
      if (invoice.amountPaid < invoice.total) {
        throw new BadRequestException('Cannot mark invoice as paid when amount paid is less than total');
      }
    }

    if (updateStatusDto.status === InvoiceStatus.OVERDUE && oldStatus !== InvoiceStatus.OVERDUE) {
      if (!invoice.dueDate) {
        throw new BadRequestException('Cannot mark invoice as overdue without a due date');
      }
      if (new Date() < invoice.dueDate) {
        throw new BadRequestException('Cannot mark invoice as overdue before due date');
      }
    }

    return this.invoiceRepository.save(invoice);
  }

  private validateStatusTransition(oldStatus: InvoiceStatus, newStatus: InvoiceStatus): void {
    const validTransitions: Record<InvoiceStatus, InvoiceStatus[]> = {
      [InvoiceStatus.DRAFT]: [InvoiceStatus.PENDING, InvoiceStatus.CANCELLED],
      [InvoiceStatus.PENDING]: [InvoiceStatus.PAID, InvoiceStatus.OVERDUE, InvoiceStatus.CANCELLED],
      [InvoiceStatus.PAID]: [InvoiceStatus.REFUNDED, InvoiceStatus.VOID],
      [InvoiceStatus.OVERDUE]: [InvoiceStatus.PAID, InvoiceStatus.CANCELLED],
      [InvoiceStatus.CANCELLED]: [],
      [InvoiceStatus.REFUNDED]: [],
      [InvoiceStatus.VOID]: [],
      [InvoiceStatus.UNPAID]: [InvoiceStatus.PENDING, InvoiceStatus.CANCELLED],
    };

    if (!validTransitions[oldStatus]?.includes(newStatus)) {
      throw new BadRequestException(
        `Invalid status transition from ${oldStatus} to ${newStatus}. ` +
        `Valid transitions from ${oldStatus} are: ${validTransitions[oldStatus]?.join(', ') || 'none'}`
      );
    }
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

  async getMonthlyInvoiceStats(insuranceCompanyId: string, month: number, year: number): Promise<InvoiceStats> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    // Get all invoices for the month
    const invoices = await this.invoiceRepository.find({
      where: {
        insuranceCompanyId,
        type: InvoiceType.PREMIUM,
        issueDate: Between(startDate, endDate)
      }
    });

    // Calculate stats
    const totalInvoices = invoices.length;
    const totalAmount = invoices.reduce((sum, invoice) => sum + Number(invoice.total), 0);
    const paidInvoices = invoices.filter(invoice => invoice.status === InvoiceStatus.PAID);
    const paidAmount = paidInvoices.reduce((sum, invoice) => sum + Number(invoice.total), 0);
    const pendingInvoices = invoices.filter(invoice => invoice.status === InvoiceStatus.PENDING);
    const pendingAmount = pendingInvoices.reduce((sum, invoice) => sum + Number(invoice.total), 0);
    const overdueInvoices = invoices.filter(invoice => 
      invoice.status === InvoiceStatus.PENDING && 
      new Date(invoice.dueDate) < new Date()
    );
    const overdueAmount = overdueInvoices.reduce((sum, invoice) => sum + Number(invoice.total), 0);

    return {
      totalInvoices,
      totalAmount,
      paidInvoices: paidInvoices.length,
      paidAmount,
      pendingInvoices: pendingInvoices.length,
      pendingAmount,
      overdueInvoices: overdueInvoices.length,
      overdueAmount,
      month,
      year
    };
  }

  async getRevenueByMonth(insuranceCompanyId: string, year: number): Promise<any[]> {
    try {
      this.logger.debug(`Calculating revenue for company ${insuranceCompanyId} and year ${year}`);

      // Validate insurance company exists
      await this.insuranceCompanyService.findById(insuranceCompanyId);

      // Get all months for the year
      const months = Array.from({ length: 12 }, (_, i) => i + 1);
      
      // Calculate revenue for each month
      const revenueData = await Promise.all(
        months.map(async (month) => {
          const startDate = new Date(year, month - 1, 1);
          const endDate = new Date(year, month, 0);

          this.logger.debug(`Calculating revenue for ${month}/${year} from ${startDate} to ${endDate}`);

          // Get all paid invoices for the month
          const paidInvoices = await this.invoiceRepository.find({
            where: {
              insuranceCompanyId,
              status: InvoiceStatus.PAID,
              createdAt: Between(startDate, endDate),
            },
            relations: ['payments'],
          });

          // Calculate total revenue for the month
          const revenue = paidInvoices.reduce((total, invoice) => {
            const paidAmount = invoice.payments.reduce((sum, payment) => {
              if (payment.status === PaymentStatus.COMPLETED) {
                return sum + payment.amount;
              }
              return sum;
            }, 0);
            return total + paidAmount;
          }, 0);

          this.logger.debug(`Revenue for ${month}/${year}: ${revenue}`);

          return {
            month,
            revenue,
          };
        })
      );

      return revenueData;
    } catch (error) {
      this.logger.error(`Error calculating monthly revenue: ${error.message}`, error.stack);
      throw error;
    }
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
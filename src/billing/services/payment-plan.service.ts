import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, FindManyOptions, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { PaymentPlan, PaymentPlanStatus, PaymentFrequency } from '../entities/payment-plan.entity';
import { Invoice, InvoiceStatus } from '../entities/invoice.entity';
import { CreatePaymentPlanDto } from '../dto/create-payment-plan.dto';
import { PaymentPlanResponseDto } from '../dto/payment-plan-response.dto';
import { InvoiceService } from './invoice.service';
import { addDays, addMonths, addWeeks } from 'date-fns';

@Injectable()
export class PaymentPlanService {
  constructor(
    @InjectRepository(PaymentPlan)
    private paymentPlanRepository: Repository<PaymentPlan>,
    @InjectRepository(Invoice)
    private invoiceRepository: Repository<Invoice>,
    private invoiceService: InvoiceService,
  ) {}

  async create(createPaymentPlanDto: CreatePaymentPlanDto): Promise<PaymentPlan> {
    // Find the invoice
    const invoice = await this.invoiceService.findOne(createPaymentPlanDto.invoiceId);

    // Validate payment plan
    if (invoice.status === InvoiceStatus.PAID) {
      throw new BadRequestException('Cannot create payment plan for a fully paid invoice');
    }

    // Validate total amount
    if (createPaymentPlanDto.totalAmount > invoice.amountDue) {
      throw new BadRequestException(`Payment plan total amount cannot exceed the amount due (${invoice.amountDue})`);
    }

    if (createPaymentPlanDto.totalAmount <= 0) {
      throw new BadRequestException('Payment plan total amount must be greater than zero');
    }

    // Validate installment amount
    if (createPaymentPlanDto.installmentAmount <= 0) {
      throw new BadRequestException('Installment amount must be greater than zero');
    }

    // Validate total installments
    if (createPaymentPlanDto.totalInstallments <= 0) {
      throw new BadRequestException('Total installments must be greater than zero');
    }

    // Check if the installment amount * total installments equals the total amount
    const calculatedTotal = createPaymentPlanDto.installmentAmount * createPaymentPlanDto.totalInstallments;
    if (Math.abs(calculatedTotal - createPaymentPlanDto.totalAmount) > 0.01) {
      throw new BadRequestException('Installment amount multiplied by total installments must equal the total amount');
    }

    // Generate plan number
    const planNumber = await this.generatePlanNumber(invoice.invoiceNumber);

    // Create payment plan entity
    const paymentPlan = this.paymentPlanRepository.create({
      planNumber,
      invoiceId: createPaymentPlanDto.invoiceId,
      status: PaymentPlanStatus.ACTIVE,
      frequency: createPaymentPlanDto.frequency,
      totalAmount: createPaymentPlanDto.totalAmount,
      installmentAmount: createPaymentPlanDto.installmentAmount,
      totalInstallments: createPaymentPlanDto.totalInstallments,
      startDate: createPaymentPlanDto.startDate,
      endDate: createPaymentPlanDto.endDate,
      nextDueDate: createPaymentPlanDto.nextDueDate || createPaymentPlanDto.startDate,
      gracePeriodDays: createPaymentPlanDto.gracePeriodDays || 0,
      autoDebit: createPaymentPlanDto.autoDebit || false,
      paymentMethod: createPaymentPlanDto.paymentMethod,
      paymentDetails: createPaymentPlanDto.paymentDetails,
      insuranceCompanyId: createPaymentPlanDto.insuranceCompanyId,
      memberId: createPaymentPlanDto.memberId,
      corporateClientId: createPaymentPlanDto.corporateClientId,
      notes: createPaymentPlanDto.notes,
      reminderEnabled: createPaymentPlanDto.reminderEnabled || false,
      reminderDaysBefore: createPaymentPlanDto.reminderDaysBefore || 3,
    });

    // Save payment plan
    const savedPlan = await this.paymentPlanRepository.save(paymentPlan);

    // Update invoice status to reflect payment plan
    await this.invoiceRepository.update(invoice.id, {
      status: InvoiceStatus.PENDING,
    });

    return savedPlan;
  }

  async findAll(
    insuranceCompanyId: string,
    options?: {
      status?: PaymentPlanStatus;
      invoiceId?: string;
      memberId?: string;
      corporateClientId?: string;
      startDate?: Date;
      endDate?: Date;
      page?: number;
      limit?: number;
    },
  ): Promise<{ data: PaymentPlan[]; total: number; page: number; limit: number }> {
    const where: FindOptionsWhere<PaymentPlan> = { insuranceCompanyId };
    
    if (options?.status) {
      where.status = options.status;
    }
    
    if (options?.invoiceId) {
      where.invoiceId = options.invoiceId;
    }
    
    if (options?.memberId) {
      where.memberId = options.memberId;
    }
    
    if (options?.corporateClientId) {
      where.corporateClientId = options.corporateClientId;
    }

    const queryOptions: FindManyOptions<PaymentPlan> = {
      where,
      relations: ['invoice'],
      order: { createdAt: 'DESC' },
    };

    // Date filtering
    if (options?.startDate && options?.endDate) {
      queryOptions.where = {
        ...queryOptions.where,
        startDate: Between(options.startDate, options.endDate),
      };
    } else if (options?.startDate) {
      queryOptions.where = {
        ...queryOptions.where,
        startDate: MoreThanOrEqual(options.startDate),
      };
    } else if (options?.endDate) {
      queryOptions.where = {
        ...queryOptions.where,
        startDate: LessThanOrEqual(options.endDate),
      };
    }

    // Pagination
    const page = options?.page || 1;
    const limit = options?.limit || 10;
    queryOptions.skip = (page - 1) * limit;
    queryOptions.take = limit;

    const [plans, total] = await this.paymentPlanRepository.findAndCount(queryOptions);

    return {
      data: plans,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<PaymentPlan> {
    const plan = await this.paymentPlanRepository.findOne({
      where: { id },
      relations: ['invoice'],
    });

    if (!plan) {
      throw new NotFoundException(`Payment plan with ID ${id} not found`);
    }

    return plan;
  }

  async findByPlanNumber(planNumber: string): Promise<PaymentPlan> {
    const plan = await this.paymentPlanRepository.findOne({
      where: { planNumber },
      relations: ['invoice'],
    });

    if (!plan) {
      throw new NotFoundException(`Payment plan with number ${planNumber} not found`);
    }

    return plan;
  }

  async updateStatus(id: string, status: PaymentPlanStatus): Promise<PaymentPlan> {
    const plan = await this.findOne(id);
    
    // Check if the status transition is valid based on the amount paid
    if (status === PaymentPlanStatus.COMPLETED && plan.amountPaid < plan.totalAmount) {
      throw new BadRequestException(
        `Cannot mark payment plan as completed. The plan has only paid ${plan.amountPaid} out of ${plan.totalAmount}. ` +
        `Please record a payment first or use the recordPayment endpoint.`
      );
    }
    
    if (status === PaymentPlanStatus.CANCELLED && plan.amountPaid > 0) {
      throw new BadRequestException(
        `Cannot cancel payment plan with payments made. The plan has already paid ${plan.amountPaid}.`
      );
    }
    
    plan.status = status;

    // If plan is being completed, update related invoice
    if (status === PaymentPlanStatus.COMPLETED) {
      const invoice = await this.invoiceService.findOne(plan.invoiceId);
      
      // Only update invoice if it's not already paid
      if (invoice.status !== InvoiceStatus.PAID) {
        invoice.status = InvoiceStatus.PAID;
        invoice.paidDate = new Date();
        invoice.amountPaid = invoice.total;
        invoice.amountDue = 0;
        
        await this.invoiceRepository.save(invoice);
      }
    }

    return this.paymentPlanRepository.save(plan);
  }

  async recordPayment(id: string, amount: number): Promise<PaymentPlan> {
    const plan = await this.findOne(id);
    
    // Validate payment amount
    if (amount <= 0) {
      throw new BadRequestException('Payment amount must be greater than zero');
    }

    const remainingAmount = plan.totalAmount - plan.amountPaid;
    if (amount > remainingAmount) {
      throw new BadRequestException(`Payment amount cannot exceed the remaining amount (${remainingAmount})`);
    }

    // Update payment plan
    plan.amountPaid += amount;
    plan.installmentsPaid += 1;

    // Calculate next due date based on frequency
    plan.nextDueDate = this.calculateNextDueDate(plan.nextDueDate, plan.frequency);

    // Check if plan is completed
    if (plan.amountPaid >= plan.totalAmount || plan.installmentsPaid >= plan.totalInstallments) {
      plan.status = PaymentPlanStatus.COMPLETED;
      
      // Update invoice
      const invoice = await this.invoiceService.findOne(plan.invoiceId);
      
      // Only update invoice if it's not already paid
      if (invoice.status !== InvoiceStatus.PAID) {
        invoice.status = InvoiceStatus.PAID;
        invoice.paidDate = new Date();
        invoice.amountPaid = invoice.total;
        invoice.amountDue = 0;
        
        await this.invoiceRepository.save(invoice);
      }
    }

    return this.paymentPlanRepository.save(plan);
  }

  async delete(id: string): Promise<void> {
    const plan = await this.findOne(id);

    // Only allow deleting active plans with no payments
    if (plan.status !== PaymentPlanStatus.ACTIVE || plan.amountPaid > 0) {
      throw new BadRequestException(`Cannot delete payment plan with status ${plan.status} or with payments made`);
    }

    await this.paymentPlanRepository.remove(plan);
  }

  async sendReminder(id: string): Promise<PaymentPlan> {
    const plan = await this.findOne(id);

    // Only send reminders for active plans
    if (plan.status !== PaymentPlanStatus.ACTIVE) {
      throw new BadRequestException(`Cannot send reminder for payment plan with status ${plan.status}`);
    }

    // TODO: Implement actual reminder sending logic (email, SMS, etc.)

    return plan;
  }

  async checkOverduePaymentPlans(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find all active plans with next due date in the past
    const result = await this.paymentPlanRepository
      .createQueryBuilder()
      .update(PaymentPlan)
      .set({ status: PaymentPlanStatus.DEFAULTED })
      .where('status = :status', { status: PaymentPlanStatus.ACTIVE })
      .andWhere('nextDueDate < :today', { today })
      .andWhere('nextDueDate < DATE_ADD(nextDueDate, INTERVAL gracePeriodDays DAY)')
      .execute();

    return result.affected || 0;
  }

  async toResponseDto(plan: PaymentPlan): Promise<PaymentPlanResponseDto> {
    const responseDto = new PaymentPlanResponseDto();
    
    // Map basic properties
    Object.assign(responseDto, {
      id: plan.id,
      planNumber: plan.planNumber,
      invoiceId: plan.invoiceId,
      status: plan.status,
      frequency: plan.frequency,
      totalAmount: plan.totalAmount,
      amountPaid: plan.amountPaid,
      installmentAmount: plan.installmentAmount,
      totalInstallments: plan.totalInstallments,
      installmentsPaid: plan.installmentsPaid,
      startDate: plan.startDate,
      endDate: plan.endDate,
      nextDueDate: plan.nextDueDate,
      gracePeriodDays: plan.gracePeriodDays,
      autoDebit: plan.autoDebit,
      paymentMethod: plan.paymentMethod,
      paymentDetails: plan.paymentDetails,
      insuranceCompanyId: plan.insuranceCompanyId,
      memberId: plan.memberId,
      corporateClientId: plan.corporateClientId,
      notes: plan.notes,
      reminderEnabled: plan.reminderEnabled,
      reminderDaysBefore: plan.reminderDaysBefore,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
    });

    // Map related entities if loaded
    if (plan.invoice) {
      responseDto.invoiceNumber = plan.invoice.invoiceNumber;
    }

    if (plan.insuranceCompany) {
      responseDto.insuranceCompanyName = plan.insuranceCompany.name;
    }

    if (plan.member) {
      responseDto.memberName = `${plan.member.firstName} ${plan.member.lastName}`;
    }

    if (plan.corporateClient) {
      responseDto.corporateClientName = plan.corporateClient.name;
    }

    return responseDto;
  }

  private calculateNextDueDate(currentDueDate: Date, frequency: PaymentFrequency): Date {
    const date = new Date(currentDueDate);
    
    switch (frequency) {
      case PaymentFrequency.WEEKLY:
        return addWeeks(date, 1);
      case PaymentFrequency.BIWEEKLY:
        return addWeeks(date, 2);
      case PaymentFrequency.MONTHLY:
        return addMonths(date, 1);
      case PaymentFrequency.QUARTERLY:
        return addMonths(date, 3);
      case PaymentFrequency.ANNUALLY:
        return addMonths(date, 12);
      default:
        return addMonths(date, 1);
    }
  }

  private async generatePlanNumber(invoiceNumber: string): Promise<string> {
    const date = new Date();
    const timestamp = date.getTime().toString().slice(-6);
    
    // Format: INVOICE-PP-TIMESTAMP
    return `${invoiceNumber}-PP-${timestamp}`;
  }
}
import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, FindManyOptions, Between, MoreThanOrEqual, LessThanOrEqual, In } from 'typeorm';
import { Payment, PaymentStatus, PaymentType, PaymentMethod } from '../entities/payment.entity';
import { Invoice, InvoiceStatus } from '../entities/invoice.entity';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { UpdatePaymentStatusDto } from '../dto/update-payment-status.dto';
import { ProcessRefundDto } from '../dto/process-refund.dto';
import { PaymentResponseDto } from '../dto/payment-response.dto';
import { InvoiceService } from './invoice.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(Invoice)
    private invoiceRepository: Repository<Invoice>,
    private invoiceService: InvoiceService,
  ) {}

  async create(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    // Find the invoice
    const invoice = await this.invoiceService.findOne(createPaymentDto.invoiceId);

    // Validate payment amount
    if (createPaymentDto.amount <= 0) {
      throw new BadRequestException('Payment amount must be greater than zero');
    }

    if (createPaymentDto.amount > invoice.amountDue) {
      throw new BadRequestException(`Payment amount cannot exceed the amount due (${invoice.amountDue})`);
    }

    // Create payment transaction ID
    const transactionId = this.generateTransactionId();

    // Ensure cardLastFour is properly truncated to 4 characters if provided
    let cardLastFour = createPaymentDto.cardLastFour;
    if (cardLastFour && cardLastFour.length > 4) {
      cardLastFour = cardLastFour.substring(0, 4);
    }

    // Create payment entity
    const payment = this.paymentRepository.create({
      transactionId,
      invoiceId: createPaymentDto.invoiceId,
      amount: createPaymentDto.amount,
      method: createPaymentDto.method,
      type: createPaymentDto.type,
      paymentDate: createPaymentDto.paymentDate,
      status: PaymentStatus.PENDING,
      paymentReference: createPaymentDto.paymentReference,
      paymentGateway: createPaymentDto.paymentGateway,
      gatewayTransactionId: createPaymentDto.gatewayTransactionId,
      gatewayResponse: createPaymentDto.gatewayResponse,
      notes: createPaymentDto.notes,
      insuranceCompanyId: createPaymentDto.insuranceCompanyId,
      memberId: createPaymentDto.memberId,
      corporateClientId: createPaymentDto.corporateClientId,
      payerName: createPaymentDto.payerName,
      payerEmail: createPaymentDto.payerEmail,
      payerPhone: createPaymentDto.payerPhone,
      cardLastFour: cardLastFour,
      cardType: createPaymentDto.cardType,
      receiptEmail: createPaymentDto.receiptEmail,
    });

    // Save payment
    const savedPayment = await this.paymentRepository.save(payment);

    // Update invoice
    await this.updateInvoiceAfterPayment(invoice, savedPayment);

    return savedPayment;
  }

  async findAll(
    insuranceCompanyId: string,
    status?: PaymentStatus,
    type?: PaymentType,
    memberId?: string,
    invoiceId?: string,
    startDate?: Date,
    endDate?: Date,
    page = 1,
    limit = 10,
  ): Promise<{ data: Payment[]; total: number }> {
    const where: FindOptionsWhere<Payment> = { insuranceCompanyId };

    if (status) {
      where.status = status;
    }

    if (type) {
      where.type = type;
    }

    if (memberId) {
      where.memberId = memberId;
    }

    if (invoiceId) {
      where.invoiceId = invoiceId;
    }

    if (startDate && endDate) {
      where.paymentDate = Between(startDate, endDate);
    }

    const [data, total] = await this.paymentRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['invoice', 'member', 'insuranceCompany'],
    });

    return { data, total };
  }

  async findOne(id: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id },
      relations: ['invoice'],
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    return payment;
  }

  async findByTransactionId(transactionId: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { transactionId },
      relations: ['invoice'],
    });

    if (!payment) {
      throw new NotFoundException(`Payment with transaction ID ${transactionId} not found`);
    }

    return payment;
  }

  async updateStatus(id: string, updateStatusDto: UpdatePaymentStatusDto): Promise<Payment> {
    const payment = await this.findOne(id);
    const oldStatus = payment.status;
    payment.status = updateStatusDto.status;

    // Update additional fields if provided
    if (updateStatusDto.amount) payment.amount = updateStatusDto.amount;
    if (updateStatusDto.transactionId) payment.transactionId = updateStatusDto.transactionId;
    if (updateStatusDto.method) payment.method = updateStatusDto.method;
    if (updateStatusDto.notes) payment.notes = updateStatusDto.notes;
    if (updateStatusDto.gatewayResponse) payment.gatewayResponse = updateStatusDto.gatewayResponse;

    // If payment is being completed
    if (updateStatusDto.status === PaymentStatus.COMPLETED && oldStatus !== PaymentStatus.COMPLETED) {
      // Find the invoice
      const invoice = await this.invoiceService.findOne(payment.invoiceId);
      
      // Update invoice
      await this.updateInvoiceAfterPayment(invoice, payment);
    }

    // If payment is being refunded
    if (updateStatusDto.status === PaymentStatus.REFUNDED && oldStatus === PaymentStatus.COMPLETED) {
      // Find the invoice
      const invoice = await this.invoiceService.findOne(payment.invoiceId);
      
      // Revert the payment on the invoice
      invoice.amountPaid -= payment.amount;
      invoice.amountDue += payment.amount;
      
      // Update invoice status
      if (invoice.amountPaid <= 0) {
        invoice.status = InvoiceStatus.PENDING;
        invoice.paidDate = undefined;
      } else if (invoice.amountDue > 0) {
        invoice.status = InvoiceStatus.PARTIALLY_PAID;
      }
      
      await this.invoiceRepository.save(invoice);
    }

    return this.paymentRepository.save(payment);
  }

  async refund(id: string): Promise<Payment> {
    const payment = await this.findOne(id);

    if (payment.status === PaymentStatus.REFUNDED) {
      throw new BadRequestException('Payment has already been refunded');
    }

    if (payment.status !== PaymentStatus.COMPLETED) {
      throw new BadRequestException(`Cannot refund payment with status ${payment.status}`);
    }

    // Update payment status
    payment.status = PaymentStatus.REFUNDED;
    payment.refundDate = new Date();

    // Update invoice
    const invoice = await this.invoiceService.findOne(payment.invoiceId);
    invoice.amountPaid -= payment.amount;
    invoice.amountDue += payment.amount;

    // Update invoice status if necessary
    if (invoice.amountPaid <= 0) {
      invoice.status = InvoiceStatus.PENDING;
      invoice.paidDate = undefined;
    } else if (invoice.amountPaid < invoice.total) {
      invoice.status = InvoiceStatus.PARTIALLY_PAID;
    }

    await this.invoiceRepository.save(invoice);
    return this.paymentRepository.save(payment);
  }

  async delete(id: string): Promise<void> {
    const payment = await this.findOne(id);

    // Only allow deleting pending payments
    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException(`Cannot delete payment with status ${payment.status}`);
    }

    await this.paymentRepository.remove(payment);
  }

  async sendReceipt(id: string, email?: string): Promise<Payment> {
    const payment = await this.findOne(id);

    // Only send receipts for completed payments
    if (payment.status !== PaymentStatus.COMPLETED) {
      throw new BadRequestException(`Cannot send receipt for payment with status ${payment.status}`);
    }

    // Use provided email or fall back to payment's receipt email or payer email
    const receiptEmail = email || payment.receiptEmail || payment.payerEmail;
    
    if (!receiptEmail) {
      throw new BadRequestException('No email address provided for receipt');
    }

    // TODO: Implement actual receipt sending logic (email service)

    // Update receipt sent status
    payment.receiptSent = true;
    payment.receiptEmail = receiptEmail;

    return this.paymentRepository.save(payment);
  }

  async toResponseDto(payment: Payment): Promise<PaymentResponseDto> {
    const responseDto = new PaymentResponseDto();
    
    // Map basic properties
    Object.assign(responseDto, {
      id: payment.id,
      transactionId: payment.transactionId,
      invoiceId: payment.invoiceId,
      amount: payment.amount,
      status: payment.status,
      method: payment.method,
      type: payment.type,
      paymentDate: payment.paymentDate,
      paymentReference: payment.paymentReference,
      paymentGateway: payment.paymentGateway,
      gatewayTransactionId: payment.gatewayTransactionId,
      gatewayResponse: payment.gatewayResponse,
      notes: payment.notes,
      insuranceCompanyId: payment.insuranceCompanyId,
      memberId: payment.memberId,
      corporateClientId: payment.corporateClientId,
      payerName: payment.payerName,
      payerEmail: payment.payerEmail,
      payerPhone: payment.payerPhone,
      cardLastFour: payment.cardLastFour,
      cardType: payment.cardType,
      receiptSent: payment.receiptSent,
      receiptEmail: payment.receiptEmail,
      refundDate: payment.refundDate,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    });

    // Map related entities if loaded
    if (payment.invoice) {
      responseDto.invoiceNumber = payment.invoice.invoiceNumber;
    }

    if (payment.member) {
      responseDto.memberName = `${payment.member.firstName} ${payment.member.lastName}`;
    }

    if (payment.insuranceCompany) {
      responseDto.insuranceCompanyName = payment.insuranceCompany.name;
    }

    return responseDto;
  }

  async processRefund(id: string, refundDto: ProcessRefundDto): Promise<Payment> {
    const payment = await this.findOne(id);

    if (payment.status !== PaymentStatus.COMPLETED) {
      throw new BadRequestException('Only completed payments can be refunded');
    }

    // Check if payment has already been refunded
    if (payment.refundDate) {
      throw new BadRequestException('Payment has already been refunded');
    }

    // Update payment status to refunded
    payment.status = PaymentStatus.REFUNDED;
    payment.refundDate = new Date();
    payment.notes = refundDto.reason;
    
    // If this payment is linked to an invoice, update the invoice
    if (payment.invoiceId) {
      const invoice = await this.invoiceRepository.findOne({
        where: { id: payment.invoiceId },
      });
      
      if (invoice) {
        // Decrease the amount paid on the invoice
        invoice.amountPaid = +invoice.amountPaid - +refundDto.amount;
        invoice.amountDue = +invoice.total - +invoice.amountPaid;
        
        // Update invoice status if needed
        if (invoice.amountPaid <= 0) {
          invoice.status = InvoiceStatus.UNPAID;
          invoice.paidDate = undefined;
        } else if (invoice.amountPaid < invoice.total) {
          invoice.status = InvoiceStatus.PARTIALLY_PAID;
        }
        
        await this.invoiceRepository.save(invoice);
      }
    }
    
    // Create a new refund payment record
    const refundPayment = this.paymentRepository.create({
      transactionId: refundDto.transactionId || `REF-${this.generateTransactionId()}`,
      invoiceId: payment.invoiceId,
      amount: -refundDto.amount, // Negative amount to indicate refund
      status: PaymentStatus.COMPLETED,
      method: refundDto.method || payment.method,
      type: PaymentType.REFUND,
      paymentDate: new Date(),
      paymentReference: `Refund for ${payment.transactionId}`,
      paymentGateway: payment.paymentGateway,
      notes: refundDto.reason,
      gatewayResponse: refundDto.gatewayResponse,
      insuranceCompanyId: payment.insuranceCompanyId,
      memberId: payment.memberId,
      corporateClientId: payment.corporateClientId,
      payerName: payment.payerName,
      payerEmail: payment.payerEmail,
      payerPhone: payment.payerPhone,
    });
    
    await this.paymentRepository.save(refundPayment);
    
    return this.paymentRepository.save(payment);
  }

  private async updateInvoiceAfterPayment(invoice: Invoice, payment: Payment): Promise<void> {
    // Only update invoice if payment is completed
    if (payment.status === PaymentStatus.COMPLETED) {
      // Calculate new amount paid and amount due
      invoice.amountPaid = +invoice.amountPaid + +payment.amount;
      invoice.amountDue = +invoice.total - +invoice.amountPaid;

      // Update invoice status based on payment
      if (invoice.amountPaid >= invoice.total) {
        invoice.status = InvoiceStatus.PAID;
        invoice.paidDate = new Date();
      } else if (invoice.amountPaid > 0) {
        invoice.status = InvoiceStatus.PARTIALLY_PAID;
      }

      await this.invoiceRepository.save(invoice);
    }
  }

  private generateTransactionId(): string {
    const timestamp = new Date().getTime().toString().slice(-8);
    const randomPart = uuidv4().replace(/-/g, '').substring(0, 8);
    return `TXN-${timestamp}-${randomPart}`;
  }

  // Analytics methods
  async getOutstandingPayments(insuranceCompanyId: string): Promise<number> {
    const invoices = await this.invoiceRepository.find({
      where: {
        insuranceCompanyId,
        status: In([InvoiceStatus.PENDING, InvoiceStatus.PARTIALLY_PAID, InvoiceStatus.OVERDUE]),
      },
    });
    
    return invoices.reduce((total, invoice) => total + invoice.amountDue, 0);
  }

  async getPaymentsByType(
    insuranceCompanyId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Array<{ type: string; count: number; amount: number }>> {
    const paymentTypes = Object.values(PaymentType);
    const result: Array<{ type: string; count: number; amount: number }> = [];
    
    for (const type of paymentTypes) {
      const payments = await this.paymentRepository.find({
        where: {
          insuranceCompanyId,
          type,
          paymentDate: Between(startDate, endDate),
          status: PaymentStatus.COMPLETED,
        },
      });
      
      const count = payments.length;
      const amount = payments.reduce((total, payment) => total + payment.amount, 0);
      
      result.push({
        type,
        count,
        amount,
      });
    }
    
    return result;
  }

  async getPaymentsByMethod(
    insuranceCompanyId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Array<{ method: string; count: number; amount: number }>> {
    const paymentMethods = Object.values(PaymentMethod);
    const result: Array<{ method: string; count: number; amount: number }> = [];
    
    for (const method of paymentMethods) {
      const payments = await this.paymentRepository.find({
        where: {
          insuranceCompanyId,
          method,
          paymentDate: Between(startDate, endDate),
          status: PaymentStatus.COMPLETED,
        },
      });
      
      const count = payments.length;
      const amount = payments.reduce((total, payment) => total + payment.amount, 0);
      
      result.push({
        method,
        count,
        amount,
      });
    }
    
    return result;
  }

  async getMonthlyPaymentTotals(
    insuranceCompanyId: string,
    year: number,
  ): Promise<Array<{ month: number; amount: number }>> {
    const result: Array<{ month: number; amount: number }> = [];
    
    for (let month = 1; month <= 12; month++) {
      const startOfMonth = new Date(year, month - 1, 1);
      const endOfMonth = new Date(year, month, 0);
      
      const payments = await this.paymentRepository.find({
        where: {
          insuranceCompanyId,
          paymentDate: Between(startOfMonth, endOfMonth),
          status: PaymentStatus.COMPLETED,
        },
      });
      
      const amount = payments.reduce((total, payment) => total + payment.amount, 0);
      
      result.push({
        month,
        amount,
      });
    }
    
    return result;
  }

  async getPaymentSuccessRate(
    insuranceCompanyId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<{ total: number; successful: number; failed: number; rate: number }> {
    const totalPayments = await this.paymentRepository.count({
      where: {
        insuranceCompanyId,
        paymentDate: Between(startDate, endDate),
      },
    });
    
    const successfulPayments = await this.paymentRepository.count({
      where: {
        insuranceCompanyId,
        paymentDate: Between(startDate, endDate),
        status: PaymentStatus.COMPLETED,
      },
    });
    
    const failedPayments = await this.paymentRepository.count({
      where: {
        insuranceCompanyId,
        paymentDate: Between(startDate, endDate),
        status: PaymentStatus.FAILED,
      },
    });
    
    const successRate = totalPayments > 0 ? (successfulPayments / totalPayments) * 100 : 0;
    
    return {
      total: totalPayments,
      successful: successfulPayments,
      failed: failedPayments,
      rate: successRate,
    };
  }

  async getProviderPaymentStats(
    insuranceCompanyId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<any[]> {
    try {
      this.logger.debug(`Getting provider payment stats for company ${insuranceCompanyId}`);

      const stats = await this.paymentRepository
        .createQueryBuilder('payment')
        .select('provider.id', 'providerId')
        .addSelect('provider.name', 'providerName')
        .addSelect('COUNT(DISTINCT payment.id)', 'totalPayments')
        .addSelect('COALESCE(SUM(payment.amount), 0)', 'totalAmount')
        .addSelect('COALESCE(AVG(payment.amount), 0)', 'averageAmount')
        .innerJoin('payment.provider', 'provider')
        .where('payment.insuranceCompanyId = :insuranceCompanyId', { insuranceCompanyId })
        .andWhere('payment.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
        .andWhere('payment.status = :status', { status: PaymentStatus.COMPLETED })
        .groupBy('provider.id')
        .addGroupBy('provider.name')
        .getRawMany();

      return stats.map(stat => ({
        providerId: stat.providerId,
        providerName: stat.providerName,
        totalPayments: parseInt(stat.totalPayments) || 0,
        totalAmount: parseFloat(stat.totalAmount) || 0,
        averageAmount: parseFloat(stat.averageAmount) || 0,
      }));
    } catch (error) {
      this.logger.error(`Error getting provider payment stats: ${error.message}`, error.stack);
      throw error;
    }
  }
}
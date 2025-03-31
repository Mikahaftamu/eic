import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invoice } from './entities/invoice.entity';
import { InvoiceItem } from './entities/invoice-item.entity';
import { Payment } from './entities/payment.entity';
import { PaymentPlan } from './entities/payment-plan.entity';
import { InvoiceService } from './services/invoice.service';
import { PaymentService } from './services/payment.service';
import { PaymentPlanService } from './services/payment-plan.service';
import { InvoiceController } from './controllers/invoice.controller';
import { PaymentController } from './controllers/payment.controller';
import { PaymentPlanController } from './controllers/payment-plan.controller';
import { PolicyModule } from '../policy/policy.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Invoice,
      InvoiceItem,
      Payment,
      PaymentPlan,
    ]),
    PolicyModule,
  ],
  providers: [
    InvoiceService,
    PaymentService,
    PaymentPlanService,
  ],
  controllers: [
    InvoiceController,
    PaymentController,
    PaymentPlanController,
  ],
  exports: [
    TypeOrmModule,
    InvoiceService,
    PaymentService,
    PaymentPlanService,
  ],
})
export class BillingModule {}

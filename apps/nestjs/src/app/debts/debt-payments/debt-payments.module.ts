import { Module } from '@nestjs/common';
import { DebtPaymentsService } from './debt-payments.service';
import { DebtPaymentsController } from './debt-payments.controller';

@Module({
  providers: [DebtPaymentsService],
  controllers: [DebtPaymentsController]
})
export class DebtPaymentsModule {}

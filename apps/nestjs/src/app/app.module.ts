import { Module } from "@nestjs/common";

import { AppController } from "./app.controller";
import { DebtInvitesModule } from "@api/app/debts/debt-invites/debt-invites.module";
import { AuthModule } from "@api/app/auth/auth.module";
import { ConfigModule } from "@nestjs/config";
import { DebtsModule } from "./debts/debts.module";
import { DebtPaymentsModule } from "@api/app/debts/debt-payments/debt-payments.module";

@Module({
  imports: [
    DebtInvitesModule,
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DebtsModule,
    DebtPaymentsModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}

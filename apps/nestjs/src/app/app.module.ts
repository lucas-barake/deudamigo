import { Module } from "@nestjs/common";

import { AppController } from "./app.controller";
import { DebtInvitesModule } from "@api/debts/debt-invites/debt-invites.module";
import { AuthModule } from "@api/auth/auth.module";
import { ConfigModule } from "@nestjs/config";
import { DebtsModule } from "./debts/debts.module";

@Module({
  imports: [
    DebtInvitesModule,
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DebtsModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}

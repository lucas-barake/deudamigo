import { Module } from "@nestjs/common";
import { DebtsService } from "./debts.service";
import { DebtsController } from "./debts.controller";
import { DebtInvitesModule } from "@api/debts/debt-invites/debt-invites.module";

@Module({
  imports: [DebtInvitesModule],
  providers: [DebtsService],
  controllers: [DebtsController],
})
export class DebtsModule {}

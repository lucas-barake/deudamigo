import { Module } from "@nestjs/common";
import { DebtInvitesController } from "./debt-invites.controller";
import { DebtInvitesService } from "./debt-invites.service";

@Module({
  controllers: [DebtInvitesController],
  providers: [DebtInvitesService],
})
export class DebtInvitesModule {}

import { Module } from "@nestjs/common";

import { AppController } from "./app.controller";
import { DebtInvitesModule } from "./debt-invites/debt-invites.module";

@Module({
  imports: [DebtInvitesModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}

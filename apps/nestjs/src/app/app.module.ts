import { Module } from "@nestjs/common";

import { AppController } from "./app.controller";
import { DebtInvitesModule } from "./debt-invites/debt-invites.module";
import { AuthModule } from "@api/auth/auth.module";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [
    DebtInvitesModule,
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}

import { Controller, UseGuards } from "@nestjs/common";
import { DebtInvitesService } from "@api/debts/debt-invites/debt-invites.service";
import { TsRestHandler, tsRestHandler } from "@ts-rest/nest";
import { type SendDebtInviteResponseShapes, contracts } from "@deudamigo/ts-rest";
import { FirebaseAuthGuard } from "@api/auth/guards/firebase-auth.guard";

@Controller()
@UseGuards(FirebaseAuthGuard)
export class DebtInvitesController {
  constructor(private readonly service: DebtInvitesService) {}

  @TsRestHandler(contracts.debtInvites.sendDebtInvite)
  public async sendInvite() {
    return tsRestHandler(contracts.debtInvites.sendDebtInvite, async ({ body }) => {
      const newInvite = await this.service.sendDebtInvite(body);

      return {
        body: newInvite,
        status: 200,
      } satisfies SendDebtInviteResponseShapes;
    });
  }
}

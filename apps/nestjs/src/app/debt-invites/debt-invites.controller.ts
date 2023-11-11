import { Controller } from "@nestjs/common";
import { DebtInvitesService } from "@api/debt-invites/debt-invites.service";
import { TsRestHandler, tsRestHandler } from "@ts-rest/nest";
import { type SendDebtInviteResponseShapes, debtInvitesRouter } from "@deudamigo/ts-rest";

@Controller("debt-invites")
export class DebtInvitesController {
  constructor(private readonly service: DebtInvitesService) {}

  @TsRestHandler(debtInvitesRouter.sendDebtInvite)
  public async handler() {
    return tsRestHandler(debtInvitesRouter.sendDebtInvite, async ({ body }) => {
      const newInvite = await this.service.sendDebtInvite(body);

      return {
        body: newInvite,
        status: 200,
      } satisfies SendDebtInviteResponseShapes;
    });
  }
}

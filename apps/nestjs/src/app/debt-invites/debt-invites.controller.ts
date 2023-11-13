import { Controller } from "@nestjs/common";
import { DebtInvitesService } from "@api/debt-invites/debt-invites.service";
import { TsRestHandler, tsRestHandler } from "@ts-rest/nest";
import { type SendDebtInviteResponseShapes, contracts } from "@deudamigo/ts-rest";

@Controller()
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

import { type SendDebtInviteBody } from "@deudamigo/ts-rest";
import { Injectable } from "@nestjs/common";

@Injectable()
export class DebtInvitesService {
  public async sendDebtInvite(body: SendDebtInviteBody) {
    return {
      inviteeEmail: body.email,
      debt: {
        id: body.debtId,
        name: "Debt name",
      },
    };
  }
}

import { initContract } from "@ts-rest/core";
import { removeDebtInviteInput, sendDebtInviteInput } from "./input";
import { type SendDebtInviteResult } from "./output";

const c = initContract();

export const debtInvitesContract = c.router(
  {
    sendDebtInvite: {
      method: "POST",
      path: "/send",
      body: sendDebtInviteInput,
      responses: {
        200: c.type<SendDebtInviteResult>(),
        400: c.type<{ message: string }>(),
        404: c.type<{ message: string }>(),
        500: c.type<{ message: string }>(),
      },
      summary: "Send a debt invite (must be a lender)",
    },
    removeDebtInvite: {
      method: "DELETE",
      path: "/remove",
      body: removeDebtInviteInput,
      responses: {
        204: c.type<null>(),
        500: c.type<{ message: string }>(),
      },
      summary: "Remove a debt invite (must be a lender)",
    },
  },
  {
    pathPrefix: "/debt-invites",
    strictStatusCodes: true,
  }
);

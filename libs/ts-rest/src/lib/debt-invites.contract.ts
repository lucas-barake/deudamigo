import { type ServerInferResponses, initContract } from "@ts-rest/core";
import { z } from "zod";

const c = initContract();

export const sendDebtInviteBodySchema = z.object({
  email: z.string().email({
    message: "Invalid email address",
  }),
  debtId: z.string().uuid(),
});
export type SendDebtInviteBody = z.infer<typeof sendDebtInviteBodySchema>;

export const debtInvitesRouter = c.router(
  {
    sendDebtInvite: {
      method: "POST",
      path: "/send",
      body: sendDebtInviteBodySchema,
      responses: {
        200: z.object({
          inviteeEmail: z.string().email(),
          debt: z.object({
            id: z.string().uuid(),
            name: z.string(),
          }),
        }),
        400: z.object({
          message: z.string(),
        }),
        401: z.object({
          message: z.string(),
        }),
        500: z.object({
          message: z.string(),
        }),
      },
      summary: "Send a debt invite (must be a lender)",
      strictStatusCodes: true,
    },
    removeDebtInvite: {
      method: "DELETE",
      path: "/:debtId",
      body: z.object({
        inviteeEmail: z.string().email(),
      }),
      pathParams: z.object({
        debtId: z.string().uuid(),
      }),
      responses: {
        204: z.undefined(),
        404: z.object({
          message: z.string(),
        }),
        500: z.object({
          message: z.string(),
        }),
      },
      summary: "Remove a debt invite (must be a lender)",
      strictStatusCodes: true,
    },
  },
  {
    pathPrefix: "/debt-invites",
  }
);

export type SendDebtInviteResponseShapes = ServerInferResponses<
  typeof debtInvitesRouter.sendDebtInvite
>;

import { z } from "zod";

export const sendDebtInviteInput = z.object({
  email: z.string().email({
    message: "Invalid email address",
  }),
  debtId: z.string().uuid(),
});
export type SendDebtInviteInput = z.infer<typeof sendDebtInviteInput>;

export const removeDebtInviteInput = z.object({
  debtId: z.string().uuid(),
  inviteeEmail: z.string().email(),
});
export type RemoveDebtInviteInput = z.infer<typeof removeDebtInviteInput>;

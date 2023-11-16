import { createTRPCRouter, trpcProcedures } from "../../../trpc";
import { TRPCError } from "@trpc/server";
import { Logger } from "../../../utils/logger";
import { DebtInvitesService } from "./debt-invites.service";
import { removeDebtInviteInput, sendDebtInviteInput } from "@deudamigo/api-contracts";

const debtInvitesService = DebtInvitesService.getInstance();

export const debtInvitesController = createTRPCRouter({
  sendInvite: trpcProcedures.protected
    .input(sendDebtInviteInput)
    .mutation(async ({ ctx, input }) => {
      try {
        if (input.email === ctx.session.user.email) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "You can't invite yourself",
          });
        }

        return await debtInvitesService.sendDebtInvite(input, ctx.session.user);
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        Logger.error(`Send debt invite: ${error}`);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.name : "Internal server error",
        });
      }
    }),

  removeInvite: trpcProcedures.protected
    .input(removeDebtInviteInput)
    .mutation(async ({ ctx, input }) => {
      try {
        return await debtInvitesService.removeDebtInvite(input, ctx.session.user);
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        Logger.error(`Remove debt invite: ${error}`);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.name : "Internal server error",
        });
      }
    }),
});

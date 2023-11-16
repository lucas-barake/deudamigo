import { createTRPCRouter, trpcProcedures } from "../../trpc";
import { Logger } from "../../utils/logger";
import { TRPCError } from "@trpc/server";
import { DebtsService } from "./debts.service";
import {
  archiveDebtInput,
  createDebtInput,
  getBorrowerDebtsInput,
  getDebtBorrowersAndPendingBorrowersInput,
  getLenderDebtsInput,
  getPartnersInput,
} from "@deudamigo/api-contracts";

export const debtsController = createTRPCRouter({
  create: trpcProcedures.protected.input(createDebtInput).mutation(async ({ ctx, input }) => {
    try {
      if (input.borrowerEmails.some((email) => email === ctx.session.user.email)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You cannot invite yourself",
        });
      }

      const debtsService = DebtsService.getInstance();

      return await debtsService.createDebt(input, ctx.session.user);
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      Logger.error(`Create debt: ${error}`);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Internal server error",
      });
    }
  }),

  archive: trpcProcedures.protected.input(archiveDebtInput).mutation(async ({ input, ctx }) => {
    try {
      const debtsService = DebtsService.getInstance();

      return await debtsService.archiveDebt(input, ctx.session.user);
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      Logger.error(`Archive debt: ${error}`);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Internal server error",
      });
    }
  }),

  getPartners: trpcProcedures.protected.input(getPartnersInput).query(async ({ ctx, input }) => {
    try {
      const debtsService = DebtsService.getInstance();

      return await debtsService.getPartners(input, ctx.session.user);
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      Logger.error(`Get partners: ${error}`);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Internal server error",
      });
    }
  }),

  getLenderDebts: trpcProcedures.protected
    .input(getLenderDebtsInput)
    .query(async ({ ctx, input }) => {
      try {
        const debtsService = DebtsService.getInstance();

        return await debtsService.getLenderDebts(input, ctx.session.user);
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        Logger.error(`Get lender debts: ${error}`);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Internal server error",
        });
      }
    }),

  getBorrowerDebts: trpcProcedures.protected
    .input(getBorrowerDebtsInput)
    .query(async ({ ctx, input }) => {
      try {
        const debtsService = DebtsService.getInstance();

        return await debtsService.getBorrowerDebts(input, ctx.session.user);
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        Logger.error(`Get borrower debts: ${error}`);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Internal server error",
        });
      }
    }),

  getDebtBorrowersAndPendingBorrowers: trpcProcedures.protected
    .input(getDebtBorrowersAndPendingBorrowersInput)
    .query(async ({ ctx, input }) => {
      try {
        const debtsService = DebtsService.getInstance();

        return await debtsService.getDebtBorrowersAndPendingBorrowers(input, ctx.session.user);
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        Logger.error(`Get debt borrowers and pending borrowers: ${error}`);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Internal server error",
        });
      }
    }),
});

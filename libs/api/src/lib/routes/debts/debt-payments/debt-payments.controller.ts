import { createTRPCRouter, trpcProcedures } from "../../../trpc";
import { DebtPaymentsService } from "./debt-payments.service";
import { Logger } from "../../../utils/logger";
import { TRPCError } from "@trpc/server";
import {
  addPaymentInput,
  confirmPaymentInput,
  getPaymentsAsBorrowerInput,
  getPaymentsAsLenderInput,
  removePaymentInput,
} from "@deudamigo/api-contracts";

const debtPaymentsService = new DebtPaymentsService();
export const debtPaymentsController = createTRPCRouter({
  add: trpcProcedures.protected.input(addPaymentInput).mutation(async ({ ctx, input }) => {
    try {
      return await debtPaymentsService.addPayment(input, ctx.session.user);
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      Logger.error(`Error adding payment: ${error}`);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Error adding payment",
      });
    }
  }),

  remove: trpcProcedures.protected.input(removePaymentInput).mutation(async ({ ctx, input }) => {
    try {
      return await debtPaymentsService.removePayment(input, ctx.session.user);
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      Logger.error(`Error removing payment: ${error}`);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Error removing payment",
      });
    }
  }),

  confirm: trpcProcedures.protected.input(confirmPaymentInput).mutation(async ({ ctx, input }) => {
    try {
      return await debtPaymentsService.confirmPayment(input, ctx.session.user);
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      Logger.error(`Error confirming payment: ${error}`);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Error confirming payment",
      });
    }
  }),

  getPaymentsAsBorrower: trpcProcedures.protected
    .input(getPaymentsAsBorrowerInput)
    .query(async ({ ctx, input }) => {
      try {
        return await debtPaymentsService.getPaymentsAsBorrower(input, ctx.session.user);
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        Logger.error(`Error getting payments as borrower: ${error}`);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error getting payments as borrower",
        });
      }
    }),

  getPaymentsAsLender: trpcProcedures.protected
    .input(getPaymentsAsLenderInput)
    .query(async ({ ctx, input }) => {
      try {
        return await debtPaymentsService.getPaymentsAsLender(input, ctx.session.user);
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        Logger.error(`Error getting payments as lender: ${error}`);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error getting payments as lender",
        });
      }
    }),
});

import { authController } from "./routes/auth/auth.controller";
import { createTRPCRouter } from "./trpc";
import { debtsController } from "./routes/debts/debts.controller";
import { debtInvitesController } from "./routes/debts/debt-invites/debt-invites.controller";
import { debtPaymentsController } from "./routes/debts/debt-payments/debt-payments.controller";

export const appRouter = createTRPCRouter({
  auth: authController,
  debts: debtsController,
  debtInvites: debtInvitesController,
  debtPayments: debtPaymentsController,
});

export type AppRouter = typeof appRouter;

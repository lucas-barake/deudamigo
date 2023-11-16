import { initContract } from "@ts-rest/core";
import { debtInvitesContract } from "./lib/debt-invites";
import { authContract } from "./lib/auth.contract";
import { debtsContract } from "./lib/debts";
import { debtPaymentsContract } from "./lib/debt-payments";

const c = initContract();

export * from "./lib/debt-invites";
export * from "./lib/auth.contract";
export * from "./lib/debts";
export * from "./lib/debt-payments";
export * from "./lib/_shared";

export const contracts = c.router({
  debtInvites: debtInvitesContract,
  debts: debtsContract,
  auth: authContract,
  debtPayments: debtPaymentsContract,
});

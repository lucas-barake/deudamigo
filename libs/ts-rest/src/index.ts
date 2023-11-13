import { initContract } from "@ts-rest/core";
import { debtInvitesRouter } from "./lib/debt-invites.contract";
import { authContract } from "./lib/auth.contract";
import { debtsContract } from "./lib/debts";

const c = initContract();

export * from "./lib/debt-invites.contract";
export * from "./lib/auth.contract";
export * from "./lib/debts";

export const contracts = c.router({
  debtInvites: debtInvitesRouter,
  debts: debtsContract,
  auth: authContract,
});

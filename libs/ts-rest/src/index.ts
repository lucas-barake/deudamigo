import { initContract } from "@ts-rest/core";
import { debtInvitesRouter } from "./lib/debt-invites.contract";
import { authContract } from "./lib/auth.contract";

const c = initContract();

export * from "./lib/debt-invites.contract";
export * from "./lib/auth.contract";

export const contracts = c.router({
  debtInvites: debtInvitesRouter,
  auth: authContract,
});

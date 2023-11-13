import { initContract } from "@ts-rest/core";
import { createDebtInput, getBorrowerDebtsInput, getLenderDebtsInput } from "./input";
import { z } from "zod";
import {
  type ArchiveDebtResult,
  type CreateDebtResult,
  type GetBorrowerDebtsResult,
  type GetLenderDebtsResult,
  type GetPartnersResult,
} from "./output";

const c = initContract();

export const debtsContract = c.router(
  {
    create: {
      method: "POST",
      path: "/create",
      body: createDebtInput,
      responses: {
        200: c.type<CreateDebtResult>(),
        400: c.type<{ message: string }>(),
        403: c.type<{ message: string }>(),
        500: c.type<{ message: string }>(),
      },
    },
    archive: {
      method: "POST",
      path: "/:id/archive",
      pathParams: z.object({
        id: z.string().uuid(),
      }),
      body: c.type<object>(),
      responses: {
        200: c.type<ArchiveDebtResult>(),
        400: c.type<{ message: string }>(),
        403: c.type<{ message: string }>(),
        500: c.type<{ message: string }>(),
      },
    },
    getPartners: {
      method: "GET",
      path: "/partners/:role",
      pathParams: z.object({
        role: z.union([z.literal("lender"), z.literal("borrower")]),
      }),
      responses: {
        200: c.type<GetPartnersResult>(),
        400: c.type<{ message: string }>(),
        403: c.type<{ message: string }>(),
        500: c.type<{ message: string }>(),
      },
    },
    getLenderDebts: {
      method: "GET",
      path: "/lender",
      query: getLenderDebtsInput,
      responses: {
        200: c.type<GetLenderDebtsResult>(),
        400: c.type<{ message: string }>(),
        500: c.type<{ message: string }>(),
      },
    },
    getBorrowerDebts: {
      method: "GET",
      path: "/borrower",
      query: getBorrowerDebtsInput,
      responses: {
        200: c.type<GetBorrowerDebtsResult>(),
        400: c.type<{ message: string }>(),
        500: c.type<{ message: string }>(),
      },
    },
  },
  {
    pathPrefix: "/debts",
  }
);

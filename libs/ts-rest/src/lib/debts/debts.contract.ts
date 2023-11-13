import { initContract } from "@ts-rest/core";
import { createDebtInput, getBorrowerDebtsInput, getLenderDebtsInput } from "./input";
import { type Debt, type Prisma, type User } from "@deudamigo/database";
import { z } from "zod";

const c = initContract();

export const getUserDebtsSelect = {
  id: true,
  name: true,
  description: true,
  createdAt: true,
  amount: true,
  archived: true,
  dueDate: true,
  currency: true,
  recurringFrequency: true,
  duration: true,
  lender: {
    select: {
      id: true,
      name: true,
      image: true,
      email: true,
    },
  },
  borrowers: {
    select: {
      payments: {
        select: {
          id: true,
          status: true,
          amount: true,
        },
      },
      user: {
        select: {
          id: true,
          image: true,
          name: true,
          email: true,
        },
      },
      balance: true,
    },
  },
} satisfies Prisma.DebtSelect;
export type GetUserDebts = Prisma.DebtGetPayload<{
  select: typeof getUserDebtsSelect;
}>;
export type GetPartnersResult = Array<{
  email: User["email"];
  image: User["image"];
  name: User["name"];
}>;

export const debtsContract = c.router(
  {
    create: {
      method: "POST",
      path: "/create",
      body: createDebtInput,
      responses: {
        200: c.type<GetUserDebts>(),
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
        200: c.type<{
          id: Debt["id"];
        }>(),
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
        200: c.type<{
          debts: GetUserDebts[];
          count: number;
        }>(),
        400: c.type<{ message: string }>(),
        500: c.type<{ message: string }>(),
      },
    },
    getBorrowerDebts: {
      method: "GET",
      path: "/borrower",
      query: getBorrowerDebtsInput,
      responses: {
        200: c.type<{
          debts: GetUserDebts[];
          count: number;
        }>(),
        400: c.type<{ message: string }>(),
        500: c.type<{ message: string }>(),
      },
    },
  },
  {
    pathPrefix: "/debts",
  }
);

import { type Prisma } from "@deudamigo/database";

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

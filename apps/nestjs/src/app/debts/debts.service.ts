import { Injectable } from "@nestjs/common";
import {
  contracts,
  type CreateDebtInput,
  DEBTS_QUERY_PAGINATION_LIMIT,
  type GetDebtBorrowersAndPendingBorrowersInput,
  type GetDebtBorrowersAndPendingBorrowersResult,
  type GetLenderDebtsInput,
  type GetPartnersResult,
  type GetUserDebts,
  getUserDebtsSelect,
} from "@deudamigo/ts-rest";
import { PaymentStatus, prisma, type Prisma } from "@deudamigo/database";
import { type ReqWithUser } from "@api/app/auth/guards/firebase-auth.guard";
import { DateTime } from "luxon";
import { TsRestException } from "@ts-rest/nest";

@Injectable()
export class DebtsService {
  constructor() {}

  public createDebt(data: CreateDebtInput, user: ReqWithUser["user"]): Promise<GetUserDebts> {
    return prisma.$transaction(async (transactionPrisma) => {
      const newDebt = await transactionPrisma.debt.create({
        data: {
          name: data.generalInfo.name,
          description: data.generalInfo.description,
          currency: data.generalInfo.currency,
          lender: {
            connect: {
              id: user.id,
            },
          },
          amount: data.generalInfo.amount,
          dueDate: data.generalInfo.dueDate,
          recurringFrequency: data.generalInfo.recurrency?.frequency,
          duration: data.generalInfo.recurrency?.duration,
        },
        select: getUserDebtsSelect,
      });

      await transactionPrisma.pendingInvite.createMany({
        data: data.borrowerEmails.map((email) => ({
          inviteeEmail: email,
          debtId: newDebt.id,
          inviterId: user.id,
        })),
      });

      return newDebt as unknown as GetUserDebts;
    });
  }

  public async archiveDebt(debtId: string): Promise<{ id: string }> {
    return prisma.$transaction(async (transactionPrisma) => {
      const updatedDebt = await transactionPrisma.debt.update({
        where: {
          id: debtId,
        },
        data: {
          archived: DateTime.now().toUTC().toISO(),
        },
        select: {
          id: true,
        },
      });

      await transactionPrisma.pendingInvite.deleteMany({
        where: {
          debtId,
        },
      });

      return updatedDebt;
    });
  }

  public async getPartners(
    role: "lender" | "borrower",
    user: ReqWithUser["user"]
  ): Promise<GetPartnersResult> {
    if (role === "lender") {
      const borrowers = await prisma.borrower.findMany({
        where: {
          debt: {
            lenderId: user.id,
          },
        },
        select: {
          user: {
            select: {
              email: true,
              image: true,
              name: true,
            },
          },
        },
        distinct: ["userId"],
      });

      return borrowers.map((borrower) => ({
        email: borrower.user.email,
        image: borrower.user.image,
        name: borrower.user.name,
      }));
    }

    const lenders = await prisma.debt.findMany({
      where: {
        borrowers: {
          some: {
            userId: user.id,
          },
        },
      },
      select: {
        lender: {
          select: {
            email: true,
            image: true,
            name: true,
          },
        },
      },
      distinct: ["lenderId"],
    });

    return lenders.map((debt) => ({
      email: debt.lender.email,
      image: debt.lender.image,
      name: debt.lender.name,
    }));
  }

  public async getLenderDebts(
    query: GetLenderDebtsInput,
    user: ReqWithUser["user"]
  ): Promise<{
    debts: GetUserDebts[];
    count: number;
  }> {
    const where = {
      ...(query.partnerEmail && {
        borrowers: {
          some: {
            user: {
              email: query.partnerEmail,
            },
          },
        },
      }),
      ...(query.status === "active" && {
        archived: {
          equals: null,
        },
      }),
      ...(query.status === "archived" && {
        archived: {
          not: {
            equals: null,
          },
        },
      }),
      lenderId: user.id,
      payments:
        query.status === "pending-confirmation"
          ? {
              some: {
                status: {
                  equals: PaymentStatus.PENDING_CONFIRMATION,
                },
              },
            }
          : undefined,
    } satisfies Prisma.DebtWhereInput;

    const [debts, count] = await prisma.$transaction([
      prisma.debt.findMany({
        where,
        orderBy: [
          {
            createdAt: query.sort,
          },
        ],
        take: DEBTS_QUERY_PAGINATION_LIMIT,
        skip: query.skip,
        select: {
          ...getUserDebtsSelect,
        },
      }),
      prisma.debt.count({
        where,
      }),
    ]);

    return {
      debts: debts as unknown as GetUserDebts[],
      count,
    };
  }

  public async getBorrowerDebts(
    query: GetLenderDebtsInput,
    user: ReqWithUser["user"]
  ): Promise<{
    debts: GetUserDebts[];
    count: number;
  }> {
    const where = {
      ...(query.status === "archived" && {
        archived: {
          not: {
            equals: null,
          },
        },
      }),
      ...(query.partnerEmail && {
        lender: {
          email: query.partnerEmail,
        },
      }),
      borrowers: {
        some: {
          userId: user.id,
          ...(query.status === "archived" && {
            balance: {
              equals: 0,
            },
            payments: {
              every: {
                status: {
                  in: [PaymentStatus.PAID, PaymentStatus.MISSED],
                },
              },
            },
          }),
        },
      },
    } satisfies Prisma.DebtWhereInput;

    const [debts, count] = await prisma.$transaction([
      prisma.debt.findMany({
        where,
        orderBy: [
          {
            createdAt: query.sort,
          },
        ],
        take: DEBTS_QUERY_PAGINATION_LIMIT,
        skip: query.skip,
        select: {
          ...getUserDebtsSelect,
        },
      }),
      prisma.debt.count({
        where,
      }),
    ]);

    return {
      debts: debts as unknown as GetUserDebts[],
      count,
    };
  }

  public async getDebtBorrowersAndPendingBorrowers(
    input: GetDebtBorrowersAndPendingBorrowersInput,
    user: ReqWithUser["user"]
  ): Promise<GetDebtBorrowersAndPendingBorrowersResult> {
    const debt = await prisma.debt.findFirst({
      where: {
        id: input.debtId,
        lenderId: user.id,
      },
      select: {
        id: true,
        currency: true,
        borrowers: {
          select: {
            balance: true,
            user: {
              select: {
                id: true,
                email: true,
                image: true,
                name: true,
              },
            },
          },
        },
        pendingInvites: {
          select: {
            inviteeEmail: true,
          },
        },
      },
    });

    if (!debt) {
      throw new TsRestException(contracts.debts.getDebtBorrowersAndPendingBorrowers, {
        status: 404,
        body: {
          message: "Debt not found",
        },
      });
    }

    return {
      borrowers: debt.borrowers,
      pendingBorrowers: debt.pendingInvites,
    };
  }
}

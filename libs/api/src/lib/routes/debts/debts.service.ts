import { Logger } from "../../utils/logger";
import { type Session } from "../../trpc";
import { prisma } from "@deudamigo/database";
import { DateTime } from "luxon";
import { PaymentStatus, type Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import {
  type ArchiveDebtInput,
  type ArchiveDebtResult,
  type CreateDebtInput,
  type CreateDebtResult,
  DEBTS_QUERY_PAGINATION_LIMIT,
  type GetBorrowerDebtsResult,
  type GetDebtBorrowersAndPendingBorrowersInput,
  type GetDebtBorrowersAndPendingBorrowersResult,
  type GetLenderDebtsInput,
  type GetLenderDebtsResult,
  type GetPartnersInput,
  type GetPartnersResult,
  type GetUserDebts,
  getUserDebtsSelect,
} from "@deudamigo/api-contracts";

export class DebtsService {
  // eslint-disable-next-line no-use-before-define
  private static instance: DebtsService;
  private readonly logger = new Logger(DebtsService.name);

  public static getInstance(): DebtsService {
    if (!DebtsService.instance) {
      DebtsService.instance = new DebtsService();
    }

    return DebtsService.instance;
  }

  constructor() {}

  public createDebt(data: CreateDebtInput, user: Session["user"]): Promise<CreateDebtResult> {
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

      return newDebt;
    });
  }

  public async archiveDebt(
    input: ArchiveDebtInput,
    user: Session["user"]
  ): Promise<ArchiveDebtResult> {
    return prisma.$transaction(async (transactionPrisma) => {
      const updatedDebt = await transactionPrisma.debt.update({
        where: {
          id: input.debtId,
          lenderId: user.id,
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
          debtId: input.debtId,
        },
      });

      return updatedDebt;
    });
  }

  public async getPartners(
    role: GetPartnersInput,
    user: Session["user"]
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
    user: Session["user"]
  ): Promise<GetLenderDebtsResult> {
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
    user: Session["user"]
  ): Promise<GetBorrowerDebtsResult> {
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
    user: Session["user"]
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
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Debt not found",
      });
    }

    return {
      borrowers: debt.borrowers,
      pendingBorrowers: debt.pendingInvites,
    };
  }
}

import { Logger } from "../../../utils/logger";
import { TRPCError } from "@trpc/server";
import { prisma } from "@deudamigo/database";
import { type Session } from "../../../trpc";
import { PaymentStatus } from "@prisma/client";
import {
  type AddPaymentInput,
  type AddPaymentResult,
  type ConfirmPaymentInput,
  type ConfirmPaymentResult,
  type GetPaymentsAsBorrowerInput,
  type GetPaymentsAsBorrowerResult,
  type GetPaymentsAsLenderInput,
  type GetPaymentsAsLenderResult,
  type RemovePaymentInput,
  type RemovePaymentResult,
} from "@deudamigo/api-contracts";

export class DebtPaymentsService {
  // eslint-disable-next-line no-use-before-define
  private static instance: DebtPaymentsService;
  private readonly logger = new Logger(DebtPaymentsService.name);

  constructor() {}

  public static getInstance(): DebtPaymentsService {
    if (!DebtPaymentsService.instance) {
      DebtPaymentsService.instance = new DebtPaymentsService();
    }
    return DebtPaymentsService.instance;
  }

  public async addPayment(
    input: AddPaymentInput,
    user: Session["user"]
  ): Promise<AddPaymentResult> {
    const debt = await prisma.debt.findFirst({
      where: {
        id: input.debtId,
        borrowers: {
          some: { userId: user.id },
        },
        archived: { equals: null },
      },
      select: {
        id: true,
        amount: true,
        borrowers: {
          select: {
            balance: true,
            userId: true,
            debtId: true,
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

    const borrower = debt.borrowers.find((b) => b.userId === user.id);
    if (!borrower) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Borrower not found",
      });
    }

    if (borrower.balance === 0) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Balance is 0",
      });
    }

    const amount = input.fullPayment ? borrower.balance : input.amount;
    if (amount > borrower.balance) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Amount is greater than balance",
      });
    }

    const newBalance = borrower.balance - amount;

    return prisma.$transaction(async (transactionPrisma) => {
      const createdPayment = await transactionPrisma.payment.create({
        data: {
          amount,
          debtId: debt.id,
          borrowerId: borrower.userId,
          status: PaymentStatus.PENDING_CONFIRMATION,
        },
        select: { id: true },
      });

      await transactionPrisma.borrower.update({
        where: {
          userId_debtId: {
            userId: borrower.userId,
            debtId: debt.id,
          },
        },
        data: { balance: newBalance },
      });

      return {
        newPaymentId: createdPayment.id,
        newBalance,
        amount,
      };
    });
  }

  public async removePayment(
    input: RemovePaymentInput,
    user: Session["user"]
  ): Promise<RemovePaymentResult> {
    const payment = await prisma.payment.findFirst({
      where: {
        id: input.paymentId,
        borrowerId: user.id,
        status: "PENDING_CONFIRMATION",
        debt: {
          archived: {
            equals: null,
          },
        },
      },
      select: {
        id: true,
        amount: true,
        borrower: {
          select: {
            balance: true,
            debtId: true,
          },
        },
      },
    });

    if (!payment) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Payment not found",
      });
    }

    await prisma.$transaction(async (transactionPrisma) => {
      await transactionPrisma.payment.delete({
        where: {
          id: payment.id,
        },
      });

      await transactionPrisma.borrower.update({
        where: {
          userId_debtId: {
            userId: user.id,
            debtId: input.debtId,
          },
        },
        data: {
          balance: {
            increment: payment.amount,
          },
        },
      });
    });

    return {
      debtId: payment.borrower.debtId,
      paymentId: payment.id,
    };
  }

  public async confirmPayment(
    input: ConfirmPaymentInput,
    user: Session["user"]
  ): Promise<ConfirmPaymentResult> {
    const debt = await prisma.debt.findUnique({
      where: {
        id: input.debtId,
        lenderId: user.id,
        borrowers: {
          some: {
            userId: input.borrowerId,
          },
        },
        archived: {
          equals: null,
        },
        payments: {
          some: {
            id: input.paymentId,
            status: PaymentStatus.PENDING_CONFIRMATION,
          },
        },
      },
      select: {
        id: true,
      },
    });

    if (!debt) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Debt not found",
      });
    }

    const updatedPayment = await prisma.payment.update({
      where: {
        id: input.paymentId,
        debtId: input.debtId,
        borrowerId: input.borrowerId,
        status: PaymentStatus.PENDING_CONFIRMATION,
      },
      data: {
        status: PaymentStatus.PAID,
      },
      select: {
        debtId: true,
        id: true,
      },
    });

    return {
      debtId: updatedPayment.debtId,
      paymentId: updatedPayment.id,
    };
  }

  public async getPaymentsAsBorrower(
    input: GetPaymentsAsBorrowerInput,
    user: Session["user"]
  ): Promise<GetPaymentsAsBorrowerResult> {
    return prisma.payment.findMany({
      where: {
        debtId: input.debtId,
        borrowerId: user.id,
      },
      select: {
        id: true,
        status: true,
        amount: true,
        createdAt: true,
        debt: {
          select: {
            currency: true,
          },
        },
      },
    });
  }

  public async getPaymentsAsLender(
    input: GetPaymentsAsLenderInput,
    user: Session["user"]
  ): Promise<GetPaymentsAsLenderResult> {
    return prisma.debt.findUniqueOrThrow({
      where: {
        id: input.debtId,
        lenderId: user.id,
      },
      select: {
        payments: {
          select: {
            id: true,
            status: true,
            amount: true,
            createdAt: true,
            debt: {
              select: {
                currency: true,
              },
            },
            borrower: {
              select: {
                balance: true,
                user: {
                  select: {
                    id: true,
                    image: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }
}

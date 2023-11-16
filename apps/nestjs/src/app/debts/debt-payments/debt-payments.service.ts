import { Injectable } from "@nestjs/common";
import { PaymentStatus, prisma } from "@deudamigo/database";
import {
  type AddPaymentInput,
  type AddPaymentResult,
  type ConfirmPaymentInput,
  type ConfirmPaymentResult,
  contracts,
  type GetPaymentsAsBorrowerInput,
  type GetPaymentsAsBorrowerResult,
  type GetPaymentsAsLenderInput,
  type GetPaymentsAsLenderResult,
  type RemovePaymentInput,
  type RemovePaymentResult,
} from "@deudamigo/ts-rest";
import { type ReqWithUser } from "@api/app/auth/guards/firebase-auth.guard";
import { TsRestException } from "@ts-rest/nest";

@Injectable()
export class DebtPaymentsService {
  public async addPayment(
    input: AddPaymentInput,
    user: ReqWithUser["user"]
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
      throw new TsRestException(contracts.debtPayments.addPayment, {
        status: 404,
        body: { message: "Debt doesn't exist" },
      });
    }

    const borrower = debt.borrowers.find((b) => b.userId === user.id);
    if (!borrower) {
      throw new TsRestException(contracts.debtPayments.addPayment, {
        status: 404,
        body: { message: "Borrower not found" },
      });
    }

    if (borrower.balance === 0) {
      throw new TsRestException(contracts.debtPayments.addPayment, {
        status: 400,
        body: { message: "Debt already paid" },
      });
    }

    const amount = input.fullPayment ? borrower.balance : input.amount;
    if (amount > borrower.balance) {
      throw new TsRestException(contracts.debtPayments.addPayment, {
        status: 400,
        body: { message: "Payment exceeds balance" },
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
    user: ReqWithUser["user"]
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
      throw new TsRestException(contracts.debtPayments.removePayment, {
        status: 404,
        body: { message: "Payment doesn't exist" },
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
    user: ReqWithUser["user"]
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
      throw new TsRestException(contracts.debtPayments.confirmPayment, {
        status: 404,
        body: { message: "Payment doesn't exist" },
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
    user: ReqWithUser["user"]
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
    user: ReqWithUser["user"]
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

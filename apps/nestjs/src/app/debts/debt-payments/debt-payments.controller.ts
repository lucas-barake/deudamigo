import { Controller, Logger, Req, UseGuards } from "@nestjs/common";
import { TsRestException, tsRestHandler, TsRestHandler } from "@ts-rest/nest";
import { contracts } from "@deudamigo/ts-rest";
import { FirebaseAuthGuard, ReqWithUser } from "@api/auth/guards/firebase-auth.guard";
import { DebtPaymentsService } from "@api/debts/debt-payments/debt-payments.service";
import { Prisma } from "@deudamigo/database";

@Controller()
@UseGuards(FirebaseAuthGuard)
export class DebtPaymentsController {
  private logger = new Logger(DebtPaymentsController.name);

  constructor(private readonly service: DebtPaymentsService) {}

  @TsRestHandler(contracts.debtPayments.addPayment)
  public async addPayment(@Req() req: ReqWithUser) {
    return tsRestHandler(contracts.debtPayments.addPayment, async ({ body }) => {
      try {
        return {
          body: await this.service.addPayment(body, req.user),
          status: 200,
        };
      } catch (error) {
        if (error instanceof TsRestException) throw error;
        this.logger.error(`Error adding payment: ${error}`);
        return {
          body: { message: "Internal server error" },
          status: 500,
        };
      }
    });
  }

  @TsRestHandler(contracts.debtPayments.removePayment)
  public async removePayment(@Req() req: ReqWithUser) {
    return tsRestHandler(contracts.debtPayments.removePayment, async ({ body }) => {
      try {
        return {
          body: await this.service.removePayment(body, req.user),
          status: 200,
        };
      } catch (error) {
        if (error instanceof TsRestException) throw error;
        this.logger.error(`Error removing payment: ${error}`);
        return {
          body: { message: "Internal server error" },
          status: 500,
        };
      }
    });
  }

  @TsRestHandler(contracts.debtPayments.confirmPayment)
  public async confirmPayment(@Req() req: ReqWithUser) {
    return tsRestHandler(contracts.debtPayments.confirmPayment, async ({ body }) => {
      try {
        return {
          body: await this.service.confirmPayment(body, req.user),
          status: 200,
        };
      } catch (error) {
        if (error instanceof TsRestException) throw error;
        this.logger.error(`Error confirming payment: ${error}`);
        return {
          body: { message: "Internal server error" },
          status: 500,
        };
      }
    });
  }

  @TsRestHandler(contracts.debtPayments.getPaymentsAsBorrower)
  public async getPaymentsAsBorrower(@Req() req: ReqWithUser) {
    return tsRestHandler(contracts.debtPayments.getPaymentsAsBorrower, async ({ query }) => {
      try {
        return {
          body: await this.service.getPaymentsAsBorrower(query, req.user),
          status: 200,
        };
      } catch (error) {
        if (error instanceof TsRestException) throw error;
        this.logger.error(`Error getting payments as borrower: ${error}`);
        return {
          body: { message: "Internal server error" },
          status: 500,
        };
      }
    });
  }

  @TsRestHandler(contracts.debtPayments.getPaymentsAsLender)
  public async getPaymentsAsLender(@Req() req: ReqWithUser) {
    return tsRestHandler(contracts.debtPayments.getPaymentsAsLender, async ({ query }) => {
      try {
        return {
          body: await this.service.getPaymentsAsLender(query, req.user),
          status: 200,
        };
      } catch (error) {
        if (error instanceof TsRestException) throw error;
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === "P2025") {
            return {
              body: { message: "Debt not found" },
              status: 404,
            };
          }
        }
        this.logger.error(`Error getting payments as lender: ${error}`);
        return {
          body: { message: "Internal server error" },
          status: 500,
        };
      }
    });
  }
}

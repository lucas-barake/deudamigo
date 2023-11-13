import { Controller, Logger, Req, UseGuards } from "@nestjs/common";
import { DebtInvitesService } from "@api/debts/debt-invites/debt-invites.service";
import { TsRestHandler, tsRestHandler } from "@ts-rest/nest";
import { contracts } from "@deudamigo/ts-rest";
import { FirebaseAuthGuard, ReqWithUser } from "@api/auth/guards/firebase-auth.guard";
import { Prisma } from "@deudamigo/database";

@Controller()
@UseGuards(FirebaseAuthGuard)
export class DebtInvitesController {
  private logger = new Logger(DebtInvitesController.name);

  constructor(private readonly service: DebtInvitesService) {}

  @TsRestHandler(contracts.debtInvites.sendDebtInvite)
  public async sendInvite(@Req() req: ReqWithUser) {
    return tsRestHandler(contracts.debtInvites.sendDebtInvite, async ({ body }) => {
      if (body.email === req.user.email) {
        return {
          body: { message: "You can't send an invite to yourself" },
          status: 400,
        };
      }

      try {
        const debt = await this.service.getDebt(body.debtId, req.user);
        if (!debt) {
          return {
            body: { message: "Debt doesn't exist" },
            status: 404,
          };
        }

        if (debt.borrowers.some((borrower) => borrower.user.email === body.email)) {
          return {
            body: { message: "User is already a borrower" },
            status: 400,
          };
        }

        const totalCount = debt.borrowers.length + debt.pendingInvites.length;
        if (totalCount >= 4) {
          return {
            body: { message: "Debt is full" },
            status: 400,
          };
        }

        return {
          body: await this.service.sendDebtInvite(body, req.user),
          status: 200,
        };
      } catch (error) {
        this.logger.error(`Error sending invite: ${error}`);
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === "P2002") {
            return {
              body: { message: "Invite already sent" },
              status: 400,
            };
          }
        }
        return {
          body: { message: "Something went wrong" },
          status: 500,
        };
      }
    });
  }

  @TsRestHandler(contracts.debtInvites.removeDebtInvite)
  public async removeInvite() {
    return tsRestHandler(contracts.debtInvites.removeDebtInvite, async ({ body }) => {
      try {
        await this.service.removeDebtInvite(body);
        return {
          body: null,
          status: 204,
        };
      } catch (error) {
        this.logger.error(`Error removing invite: ${error}`);
        return {
          body: { message: "Something went wrong" },
          status: 500,
        };
      }
    });
  }
}

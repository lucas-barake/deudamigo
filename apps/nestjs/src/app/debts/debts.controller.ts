import { Controller, HttpStatus, Logger, Req, UseGuards } from "@nestjs/common";
import { FirebaseAuthGuard, ReqWithUser } from "@api/auth/guards/firebase-auth.guard";
import { DebtsService } from "@api/debts/debts.service";
import { tsRestHandler, TsRestHandler } from "@ts-rest/nest";
import { contracts } from "@deudamigo/ts-rest";
import { Prisma } from "@deudamigo/database";

@Controller()
@UseGuards(FirebaseAuthGuard)
export class DebtsController {
  private logger = new Logger(DebtsService.name);

  constructor(private readonly service: DebtsService) {}

  @TsRestHandler(contracts.debts.create)
  public async createDebt(@Req() req: ReqWithUser) {
    return tsRestHandler(contracts.debts.create, async ({ body }) => {
      try {
        if (body.borrowerEmails.some((email) => email === req.user.email)) {
          return {
            body: { message: "You can't create a debt with yourself" },
            status: HttpStatus.BAD_REQUEST,
          };
        }

        const newDebt = await this.service.createDebt(body, req.user);

        return {
          body: newDebt,
          status: HttpStatus.OK,
        };
      } catch (error) {
        this.logger.error(`Error creating debt: ${error}`);
        return {
          body: { message: "Something went wrong" },
          status: HttpStatus.INTERNAL_SERVER_ERROR,
        };
      }
    });
  }

  @TsRestHandler(contracts.debts.archive)
  public async archiveDebt() {
    return tsRestHandler(contracts.debts.archive, async ({ params }) => {
      try {
        const debt = await this.service.archiveDebt(params.id);

        return {
          status: HttpStatus.OK,
          body: debt,
        };
      } catch (error) {
        this.logger.error(`Error archiving debt: ${error}`);
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          return {
            status: HttpStatus.BAD_REQUEST,
            body: { message: "Record doesn't exist" },
          };
        }
        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          body: { message: "Something went wrong" },
        };
      }
    });
  }

  @TsRestHandler(contracts.debts.getPartners)
  public async getPartners(@Req() req: ReqWithUser) {
    return tsRestHandler(contracts.debts.getPartners, async ({ params }) => {
      try {
        const partners = await this.service.getPartners(params.role, req.user);

        return {
          status: HttpStatus.OK,
          body: partners,
        };
      } catch (error) {
        this.logger.error(`Error getting partners: ${error}`);
        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          body: { message: "Something went wrong" },
        };
      }
    });
  }

  @TsRestHandler(contracts.debts.getLenderDebts)
  public async getLenderDebts(@Req() req: ReqWithUser) {
    return tsRestHandler(contracts.debts.getLenderDebts, async ({ query }) => {
      try {
        const debtsAndCount = await this.service.getLenderDebts(query, req.user);

        return {
          status: HttpStatus.OK,
          body: debtsAndCount,
        };
      } catch (error) {
        this.logger.error(`Error getting lender debts: ${error}`);
        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          body: { message: "Something went wrong" },
        };
      }
    });
  }

  @TsRestHandler(contracts.debts.getBorrowerDebts)
  public async getBorrowerDebts(@Req() req: ReqWithUser) {
    return tsRestHandler(contracts.debts.getBorrowerDebts, async ({ query }) => {
      try {
        const debtsAndCount = await this.service.getBorrowerDebts(query, req.user);

        return {
          status: HttpStatus.OK,
          body: debtsAndCount,
        };
      } catch (error) {
        this.logger.error(`Error getting borrower debts: ${error}`);
        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          body: { message: "Something went wrong" },
        };
      }
    });
  }
}

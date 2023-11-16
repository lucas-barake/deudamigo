import { Logger } from "../../../utils/logger";
import { type Session } from "../../../trpc";
import { prisma } from "@deudamigo/database";
import { TRPCError } from "@trpc/server";
import {
  DEBT_MAX_BORROWERS,
  type RemoveDebtInviteInput,
  type RemoveDebtInviteResult,
  type SendDebtInviteInput,
  type SendDebtInviteResult,
} from "@deudamigo/api-contracts";

export class DebtInvitesService {
  // eslint-disable-next-line no-use-before-define
  private static instance: DebtInvitesService;
  private readonly logger = new Logger(DebtInvitesService.name);

  constructor() {}

  public static getInstance(): DebtInvitesService {
    if (!DebtInvitesService.instance) {
      DebtInvitesService.instance = new DebtInvitesService();
    }

    return DebtInvitesService.instance;
  }

  public async sendDebtInvite(
    data: SendDebtInviteInput,
    user: Session["user"]
  ): Promise<SendDebtInviteResult> {
    const debt = await prisma.debt.findFirst({
      where: {
        id: data.debtId,
        lenderId: user.id,
        archived: {
          equals: null,
        },
      },
      select: {
        name: true,
        borrowers: {
          select: {
            user: {
              select: {
                email: true,
              },
            },
          },
        },
        pendingInvites: {
          select: {
            inviteeEmail: true,
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

    if (debt.borrowers.some((borrower) => borrower.user.email === data.email)) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "User is already a borrower",
      });
    }

    if (debt.pendingInvites.some((invite) => invite.inviteeEmail === data.email)) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "User already has a pending invite",
      });
    }

    if (debt.borrowers.length + debt.pendingInvites.length >= DEBT_MAX_BORROWERS) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Debt has reached the maximum number of borrowers",
      });
    }

    return prisma.pendingInvite.create({
      data: {
        debt: {
          connect: {
            id: data.debtId,
          },
        },
        inviteeEmail: data.email,
        inviter: {
          connect: {
            id: user.id,
          },
        },
      },
      select: {
        inviteeEmail: true,
        debt: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  public async removeDebtInvite(
    data: RemoveDebtInviteInput,
    user: Session["user"]
  ): Promise<RemoveDebtInviteResult> {
    return prisma.pendingInvite.delete({
      where: {
        inviteeEmail_debtId: {
          inviteeEmail: data.inviteeEmail,
          debtId: data.debtId,
        },
        inviterId: user.id,
      },
      select: {
        inviteeEmail: true,
        debtId: true,
      },
    });
  }
}

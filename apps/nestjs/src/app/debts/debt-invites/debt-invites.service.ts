import {
  type RemoveDebtInviteInput,
  type RemoveDebtInviteResult,
  type SendDebtInviteInput,
  type SendDebtInviteResult,
} from "@deudamigo/ts-rest";
import { Injectable } from "@nestjs/common";
import { type ReqWithUser } from "@api/auth/guards/firebase-auth.guard";
import { prisma } from "@deudamigo/database";

@Injectable()
export class DebtInvitesService {
  public async getDebt(debtId: string, user: ReqWithUser["user"]) {
    return prisma.debt.findFirst({
      where: {
        id: debtId,
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
            debtId: true,
          },
        },
      },
    });
  }

  public async sendDebtInvite(
    data: SendDebtInviteInput,
    user: ReqWithUser["user"]
  ): Promise<SendDebtInviteResult> {
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

  public async removeDebtInvite(data: RemoveDebtInviteInput): Promise<RemoveDebtInviteResult> {
    return prisma.pendingInvite.delete({
      where: {
        inviteeEmail_debtId: {
          debtId: data.debtId,
          inviteeEmail: data.inviteeEmail,
        },
      },
      select: {
        debtId: true,
        inviteeEmail: true,
      },
    });
  }
}

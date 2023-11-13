import { admin } from "@api/auth/firebase-admin.module";
import { Injectable, Logger } from "@nestjs/common";
import { type DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import { prisma, type Prisma } from "@deudamigo/database";
import { type User } from "@deudamigo/ts-rest";

const userSelect = {
  email: true,
  image: true,
  name: true,
  activeSubscription: {
    select: {
      endDate: true,
      nextDueDate: true,
      startDate: true,
      status: true,
      type: true,
    },
  },
} satisfies Prisma.UserSelect;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor() {}

  public async revokeToken(sessionCookie: string): Promise<boolean> {
    try {
      const decodedClaims = await admin.auth().verifySessionCookie(sessionCookie, true);
      await admin.auth().revokeRefreshTokens(decodedClaims.sub);
      return true;
    } catch (error) {
      this.logger.error(`Error during token revocation process: ${error}`);
      return false;
    }
  }

  public async verifyAndUpsertUser(token: string): Promise<{
    decodedToken: DecodedIdToken;
    userInfo: User;
  }> {
    const decodedToken = await admin.auth().verifyIdToken(token);
    const userInfo = await prisma.user.upsert({
      where: { email: decodedToken.email },
      create: {
        id: decodedToken.uid,
        email: decodedToken.email,
        image: decodedToken.picture,
        name: decodedToken.name,
      },
      update: {
        image: decodedToken.picture,
        name: decodedToken.name,
      },
      select: userSelect,
    });
    return { decodedToken, userInfo };
  }

  public async createSessionCookie(token: string): Promise<{
    sessionCookie: string;
    expiresIn: number;
  }> {
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
    const sessionCookie = await admin.auth().createSessionCookie(token, { expiresIn });
    return { sessionCookie, expiresIn };
  }

  public async getUserInfo(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
      select: userSelect,
    });
  }
}

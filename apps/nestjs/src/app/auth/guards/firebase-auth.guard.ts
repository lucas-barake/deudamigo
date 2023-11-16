import { admin } from "@api/app/auth/firebase-admin.module";
import { type CanActivate, type ExecutionContext, Injectable, Logger } from "@nestjs/common";
import { type Request } from "express";

export type ReqWithUser = Request & {
  user: {
    id: string;
    email: string;
  };
  token: string;
};

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  private logger = new Logger(FirebaseAuthGuard.name);

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<ReqWithUser>();
    const sessionCookie = request.cookies.session as string | undefined | null;

    if (sessionCookie === undefined || sessionCookie === null) return false;

    try {
      const decodedClaims = await admin.auth().verifySessionCookie(sessionCookie, true);

      if (decodedClaims.email === undefined) return false;
      request.user = {
        email: decodedClaims.email,
        id: decodedClaims.dbUserId,
      };

      return true;
    } catch (error) {
      this.logger.error(`Error during token verification process: ${error}`);
      return false;
    }
  }
}

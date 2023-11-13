import { admin } from "@api/auth/firebase-admin.module";
import { Injectable, type CanActivate, type ExecutionContext } from "@nestjs/common";
import { type Request } from "express";

type NonOptional<T extends object, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;
export type ReqWithUser = Request & {
  user: NonOptional<admin.auth.DecodedIdToken, "email">;
  token: string;
};

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<ReqWithUser>();
    const sessionCookie = request.cookies.session as string | undefined | null;

    if (sessionCookie === undefined || sessionCookie === null) return false;

    return admin
      .auth()
      .verifySessionCookie(sessionCookie, true)
      .then((decodedClaims) => {
        if (decodedClaims.email === undefined) return false;

        request.user = decodedClaims as ReqWithUser["user"];
        return true;
      })
      .catch(() => {
        return false;
      });
  }
}

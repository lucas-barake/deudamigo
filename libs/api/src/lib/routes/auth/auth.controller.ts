import { AuthService } from "$/lib/routes/auth/auth.service";
import { loginInput } from "$/lib/routes/auth/input";
import { createTRPCRouter, trpcProcedures } from "$/lib/trpc";
import { Logger } from "$/lib/utils/logger";
import { TRPCError } from "@trpc/server";
import { setCookie } from "cookies-next";

export const authRoute = createTRPCRouter({
  login: trpcProcedures.public.input(loginInput).mutation(async ({ ctx, input }) => {
    const logger = new Logger("login");
    const accessToken = input.authorization.split("Bearer ")[1];

    try {
      const authService = AuthService.getInstance();

      const { userInfo } = await authService.verifyAndUpsertUser(accessToken);

      const { sessionCookie, expiresIn } = await authService.createSessionCookie(accessToken);
      setCookie("session", sessionCookie, {
        req: ctx.req,
        res: ctx.res,
        maxAge: expiresIn,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      });

      return userInfo;
    } catch (error) {
      if (error instanceof Error) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: error.message,
        });
      }
      logger.error(`Login: ${error}`);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: error instanceof Error ? error.name : "Internal server error",
      });
    }
  }),

  me: trpcProcedures.protected.query(async ({ ctx }) => {
    const authService = AuthService.getInstance();
    const userInfo = await authService.getUserInfo(ctx.session.user.email);

    if (!userInfo) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    return userInfo;
  }),

  logout: trpcProcedures.protected.mutation(async ({ ctx }) => {
    const authService = AuthService.getInstance();
    await authService.revokeToken(ctx.session.sessionCookie);

    return true;
  }),
});

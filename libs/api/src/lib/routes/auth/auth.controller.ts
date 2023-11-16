import { AuthService } from "./auth.service";
import { createTRPCRouter, trpcProcedures } from "../../trpc";
import { Logger } from "../../utils/logger";
import { TRPCError } from "@trpc/server";
import { setCookie } from "cookies-next";
import { loginInput } from "@deudamigo/api-contracts";

const authService = AuthService.getInstance();

export const authController = createTRPCRouter({
  login: trpcProcedures.public.input(loginInput).mutation(async ({ ctx, input }) => {
    try {
      const { userInfo } = await authService.verifyAndUpsertUser(input.accessToken);
      const { sessionCookie, expiresIn } = await authService.createSessionCookie(input.accessToken);
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
      Logger.error(`Login: ${error}`);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: error instanceof Error ? error.name : "Internal server error",
      });
    }
  }),

  me: trpcProcedures.protected.query(async ({ ctx }) => {
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
    await authService.revokeToken(ctx.session.sessionCookie);
    return true;
  }),
});

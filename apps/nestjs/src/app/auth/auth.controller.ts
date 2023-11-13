import { FirebaseAuthGuard, type ReqWithUser } from "@api/auth/guards/firebase-auth.guard";
import { Controller, HttpStatus, Logger, Req, Res, UseGuards } from "@nestjs/common";
import { type Response } from "express";
import { AuthService } from "@api/auth/auth.service";
import { tsRestHandler, TsRestHandler } from "@ts-rest/nest";
import { contracts } from "@deudamigo/ts-rest";

@Controller()
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @TsRestHandler(contracts.auth.login)
  public async login(@Res({ passthrough: true }) res: Response) {
    return tsRestHandler(contracts.auth.login, async ({ headers }) => {
      const token = headers.authorization.split("Bearer ")[1];

      try {
        const { userInfo } = await this.authService.verifyAndUpsertUser(token);

        const { sessionCookie, expiresIn } = await this.authService.createSessionCookie(token);
        res.cookie("session", sessionCookie, {
          maxAge: expiresIn,
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        });

        return {
          status: HttpStatus.OK,
          body: userInfo,
        };
      } catch (error) {
        if (error instanceof Error) {
          // Firebase token verification failed.
          return {
            status: HttpStatus.UNAUTHORIZED,
            body: {
              message: "Unauthorized",
            },
          };
        }
        this.logger.error(`Login: ${error}`);
        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          body: {
            message: error instanceof Error ? error.name : "Internal server error",
          },
        };
      }
    });
  }

  @TsRestHandler(contracts.auth.me)
  @UseGuards(FirebaseAuthGuard)
  public async me(@Req() req: ReqWithUser) {
    return tsRestHandler(contracts.auth.me, async () => {
      try {
        const userInfo = await this.authService.getUserInfo(req.user.email);

        if (!userInfo) {
          return {
            status: HttpStatus.NOT_FOUND,
            body: {
              message: "User not found",
            },
          };
        }
        return {
          status: HttpStatus.OK,
          body: userInfo,
        };
      } catch (error: unknown) {
        this.logger.error(`Me: ${error}`);
        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          body: {
            message: "Internal server error",
          },
        };
      }
    });
  }

  @TsRestHandler(contracts.auth.logout)
  @UseGuards(FirebaseAuthGuard)
  public async logout(@Res({ passthrough: true }) res: Response, @Req() req: ReqWithUser) {
    return tsRestHandler(contracts.auth.logout, async () => {
      try {
        await this.authService.revokeToken(req.cookies.session);
        res.clearCookie("session");
        return {
          status: HttpStatus.OK,
          body: {
            message: "Logout successful",
          },
        };
      } catch (error: unknown) {
        this.logger.error(`Logout: ${error}`);
        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          body: {
            message: "Internal server error",
          },
        };
      }
    });
  }
}

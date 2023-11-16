import { TRPCError, initTRPC } from "@trpc/server";
import { prisma } from "@deudamigo/database";
import { redis } from "@deudamigo/redis";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import { ZodError } from "zod";
import superjson from "superjson";
import { admin } from "$/lib/firebase";

export type Session = {
  user: {
    id: string;
    email: string;
  };
  token: string;
};

type CreateContextOptions = {
  session: Session | null;
  req: CreateNextContextOptions["req"];
  res: CreateNextContextOptions["res"];
};
function createInnerTRPCContext(opts: CreateContextOptions) {
  return {
    prisma,
    redis,
    ...opts,
  };
}
export type InnerTRPCCtx = ReturnType<typeof createInnerTRPCContext>;

export const createTRPCContext = async (opts: CreateNextContextOptions) => {
  return createInnerTRPCContext({
    session: null,
    ...opts,
  });
};

export const trpc = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    if (error.code === "INTERNAL_SERVER_ERROR") {
      return {
        ...shape,
        message: "Internal server error",
      };
    }
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});
export const createTRPCRouter = trpc.router;
export const mergeTRPCRouters = trpc.mergeRouters;
export const createTRPCMiddleware = trpc.middleware;

const enforceUserIsAuthed = createTRPCMiddleware(async ({ ctx, next }) => {
  const sessionCookie = ctx.req.cookies.session;
  if (sessionCookie === undefined || sessionCookie === null)
    throw new TRPCError({ code: "UNAUTHORIZED" });

  try {
    const decodedClaims = await admin.auth().verifySessionCookie(sessionCookie, true);

    if (decodedClaims.email === undefined) throw new TRPCError({ code: "UNAUTHORIZED" });

    return await next({
      ctx: {
        ...ctx,
        session: {
          user: {
            email: decodedClaims.email,
            id: decodedClaims.dbUserId,
          },
          sessionCookie,
        },
      },
    });
  } catch (error) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
});

export const trpcProcedures = {
  public: trpc.procedure,
  protected: trpc.procedure.use(enforceUserIsAuthed),
};

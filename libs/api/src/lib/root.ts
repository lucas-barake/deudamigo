import { authRoute } from "$/lib/routes/auth/auth.controller";
import { mergeTRPCRouters } from "$/lib/trpc";

export const appRouter = mergeTRPCRouters(authRoute);

export type AppRouter = typeof appRouter;

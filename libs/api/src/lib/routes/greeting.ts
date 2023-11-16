import { router, publicProcedure } from "$/lib/trpc";

export const greetingRouter = router({
  getGreeting: publicProcedure.query(async () => {
    return { message: "Hello tRPC + Next.js!" };
  }),
});

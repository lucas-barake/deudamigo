import { z } from "zod";

export const loginInput = z.object({
  authorization: z.string().startsWith("Bearer "),
});

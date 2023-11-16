import { z } from "zod";

export const loginInput = z.object({
  accessToken: z.string(),
});

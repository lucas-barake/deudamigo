import { initQueryClient } from "@ts-rest/react-query";
import { contracts } from "@deudamigo/ts-rest";

export const api = initQueryClient(contracts, {
  baseUrl: process.env.NEXT_PUBLIC_API_URL as string,
  credentials: "include",
  baseHeaders: {},
  jsonQuery: true,
});

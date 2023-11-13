import { initContract, type ServerInferResponses } from "@ts-rest/core";
import { z } from "zod";
import { type $Enums } from "@prisma/client";

const c = initContract();

export type User = {
  email: string | null;
  name: string | null;
  image: string | null;
  activeSubscription: {
    type: "BASIC";
    status: $Enums.SubscriptionStatus;
    nextDueDate: Date;
    startDate: Date;
    endDate: Date;
  } | null;
};

export const authContract = c.router(
  {
    login: {
      method: "POST",
      path: "/login",
      body: z.object({}),
      headers: z.object({
        authorization: z.string().startsWith("Bearer "),
      }),
      strictStatusCodes: true,
      responses: {
        200: c.type<User>(),
        400: c.type<{ message: string }>(),
        401: c.type<{ message: string }>(),
        404: c.type<{ message: string }>(),
        500: c.type<{ message: string }>(),
      },
    },
    me: {
      method: "GET",
      path: "/me",
      strictStatusCodes: true,
      responses: {
        200: c.type<User>(),
        403: c.type<{
          error: string;
          message: string;
          statusCode: number;
        }>(),
        404: c.type<{ message: string }>(),
        500: c.type<{ message: string }>(),
      },
    },
    logout: {
      method: "POST",
      path: "/logout",
      body: z.object({}),
      strictStatusCodes: true,
      responses: {
        200: c.type<{ message: string }>(),
        400: c.type<{ message: string }>(),
        401: c.type<{ message: string }>(),
        404: c.type<{ message: string }>(),
        500: c.type<{ message: string }>(),
      },
    },
  },
  {
    pathPrefix: "/auth",
  }
);

export type MeResponse = ServerInferResponses<typeof authContract>["me"];

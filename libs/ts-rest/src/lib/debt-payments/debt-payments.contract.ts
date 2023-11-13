import { initContract } from "@ts-rest/core";
import {
  addPaymentInput,
  confirmPaymentInput,
  getPaymentsAsBorrowerInput,
  getPaymentsAsLenderInput,
  removePaymentInput,
} from "./input";
import {
  type AddPaymentResult,
  type ConfirmPaymentResult,
  type GetPaymentsAsBorrowerResult,
  type GetPaymentsAsLenderResult,
  type RemovePaymentResult,
} from "./output";

const c = initContract();

export const debtPaymentsContract = c.router(
  {
    addPayment: {
      method: "POST",
      path: "/add-payment",
      body: addPaymentInput,
      responses: {
        200: c.type<AddPaymentResult>(),
        400: c.type<{ message: string }>(),
        404: c.type<{ message: string }>(),
        500: c.type<{ message: string }>(),
      },
    },
    removePayment: {
      method: "POST",
      path: "/remove-payment",
      body: removePaymentInput,
      responses: {
        200: c.type<RemovePaymentResult>(),
        400: c.type<{ message: string }>(),
        404: c.type<{ message: string }>(),
        500: c.type<{ message: string }>(),
      },
    },
    confirmPayment: {
      method: "POST",
      path: "/confirm-payment",
      body: confirmPaymentInput,
      responses: {
        200: c.type<ConfirmPaymentResult>(),
        400: c.type<{ message: string }>(),
        404: c.type<{ message: string }>(),
        500: c.type<{ message: string }>(),
      },
    },
    getPaymentsAsBorrower: {
      method: "GET",
      path: "/get-payments-as-borrower",
      query: getPaymentsAsBorrowerInput,
      responses: {
        200: c.type<GetPaymentsAsBorrowerResult>(),
        400: c.type<{ message: string }>(),
        404: c.type<{ message: string }>(),
        500: c.type<{ message: string }>(),
      },
    },
    getPaymentsAsLender: {
      method: "GET",
      path: "/get-payments-as-lender",
      query: getPaymentsAsLenderInput,
      responses: {
        200: c.type<GetPaymentsAsLenderResult>(),
        400: c.type<{ message: string }>(),
        404: c.type<{ message: string }>(),
        500: c.type<{ message: string }>(),
      },
    },
  },
  {
    strictStatusCodes: true,
    pathPrefix: "/debt-payments",
  }
);

import { z } from "zod";

export const addPaymentInput = z.discriminatedUnion("fullPayment", [
  z.object({
    fullPayment: z.literal(true),
    amount: z.null(),
    debtId: z.string().uuid(),
  }),
  z.object({
    fullPayment: z.literal(false),
    amount: z
      .number({
        required_error: "La cantidad es requerida",
        invalid_type_error: "La cantidad es requerida",
      })
      .positive({
        message: "La cantidad ser mayor a 0",
      })
      .multipleOf(0.01, {
        message: "La cantidad debe ser múltiplo de 0.01",
      }),
    debtId: z.string().uuid(),
  }),
]);
export type AddPaymentInput = z.infer<typeof addPaymentInput>;

export const removePaymentInput = z.object({
  paymentId: z.string().uuid(),
  debtId: z.string().uuid(),
});
export type RemovePaymentInput = z.infer<typeof removePaymentInput>;

export const confirmPaymentInput = z.object({
  debtId: z.string().uuid(),
  borrowerId: z.string().uuid(),
  paymentId: z.string().uuid(),
});
export type ConfirmPaymentInput = z.infer<typeof confirmPaymentInput>;

export const getPaymentsAsBorrowerInput = z.object({
  debtId: z.string().uuid(),
});
export type GetPaymentsAsBorrowerInput = z.infer<typeof getPaymentsAsBorrowerInput>;

export const getPaymentsAsLenderInput = z.object({
  debtId: z.string().uuid(),
});
export type GetPaymentsAsLenderInput = z.infer<typeof getPaymentsAsLenderInput>;

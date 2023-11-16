import React from "react";
import { Dialog } from "$/components/ui/dialog";
import { Form } from "$/components/ui/form";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "$/components/ui/button";
import toast from "react-hot-toast";
import { handleMutationError } from "$/lib/utils/handle-mutation-error";
import { PaymentStatus } from "@prisma/client";
import { CurrencyInput } from "$/components/ui/currency-input";
import {
  addPaymentInput,
  type AddPaymentInput,
  formatCurrency,
  type GetBorrowerDebtsResult,
} from "@deudamigo/ts-rest";
import { useSession } from "$/lib/hooks/use-session";
import { api } from "$/lib/configs/react-query-client";
import { useTsRestQueryClient } from "@ts-rest/react-query";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  debt: GetBorrowerDebtsResult["debts"][number];
};

const AddPaymentDialog: React.FC<Props> = ({ open, onOpenChange, debt }) => {
  const session = useSession();
  const borrower = debt.borrowers.find(({ user }) => user.email === session.user?.email);
  const form = useForm<AddPaymentInput>({
    defaultValues: {
      fullPayment: true,
      amount: null,
      debtId: debt.id,
    },
    mode: "onChange",
    resolver: zodResolver(
      addPaymentInput.superRefine((arg, ctx) => {
        if (!arg.fullPayment && arg.amount > (borrower?.balance ?? 0)) {
          ctx.addIssue({
            code: "custom",
            message: "El pago no puede ser mayor a la deuda.",
            path: ["amount"],
          });
        }
      })
    ),
  });
  const borrowerBalance = borrower?.balance ?? 0;
  const isFullPayment = form.watch("fullPayment");
  const addPaymentMutation = api.debtPayments.addPayment.useMutation();
  const apiContext = useTsRestQueryClient(api);

  async function handleSubmit(data: AddPaymentInput): Promise<void> {
    const result = await toast.promise(
      addPaymentMutation.mutateAsync({
        body: data,
      }),
      {
        loading: "Agregando pago...",
        success: "Pago agregado exitosamente.",
        error: handleMutationError,
      }
    );

    apiContext.debts.getBorrowerDebts.setQueryData(["getBorrowerDebts"], (cache) => {
      if (cache === undefined) return cache;

      return {
        ...cache,
        debts: cache.body.debts.map((cachedDebt) => {
          if (cachedDebt.id !== debt.id) return cachedDebt;
          return {
            ...cachedDebt,
            borrowers: cachedDebt.borrowers.map((cachedBorrower) => {
              if (cachedBorrower.user.email === session.user?.email) {
                return {
                  ...cachedBorrower,
                  balance: result.body.newBalance,
                  payments: [
                    ...cachedBorrower.payments,
                    {
                      amount: result.body.amount,
                      status: PaymentStatus.PENDING_CONFIRMATION,
                      id: result.body.newPaymentId,
                    },
                  ],
                };
              }
              return cachedBorrower;
            }),
          };
        }),
        count: cache.body.count,
      } satisfies GetBorrowerDebtsResult;
    });

    onOpenChange(false);
    form.reset();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content>
        <Dialog.Header>
          <Dialog.Title>Agregar Pago</Dialog.Title>

          <Dialog.Description>
            Abona o haz un pago total de la deuda. El prestador luego podrá confirmarlo.
          </Dialog.Description>
        </Dialog.Header>

        {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
        <Form onSubmit={form.handleSubmit(handleSubmit)}>
          <Form.Group className="flex-row items-center">
            <Controller
              name="fullPayment"
              control={form.control}
              render={({ field }) => (
                <Form.Checkbox
                  id="fullPayment"
                  checked={field.value}
                  onCheckedChange={(checked) => {
                    const fullPayment = !checked;
                    if (fullPayment) return;
                    field.onChange(checked);
                    form.setValue("amount", null);
                  }}
                />
              )}
            />
            <Form.Label htmlFor="fullPayment">Pago Total</Form.Label>
          </Form.Group>

          <Form.Group className="flex-row items-center">
            <Controller
              name="fullPayment"
              control={form.control}
              render={({ field }) => (
                <Form.Checkbox
                  id="partialPayment"
                  checked={!field.value}
                  onCheckedChange={(checked) => {
                    const fullPayment = !checked;
                    if (fullPayment) return;
                    field.onChange(!checked);
                  }}
                />
              )}
            />
            <Form.Label htmlFor="partialPayment">Pago Parcial</Form.Label>
          </Form.Group>

          {!isFullPayment && (
            <Form.Group>
              <Form.Label>Cantidad</Form.Label>

              <Controller
                name="amount"
                control={form.control}
                render={({ field }) => (
                  <CurrencyInput
                    currency={debt.currency}
                    value={field.value ?? 0}
                    onChange={(args) => {
                      field.onChange(args.value);
                    }}
                  />
                )}
              />

              <Form.FieldError>{form.formState.errors.amount?.message}</Form.FieldError>
            </Form.Group>
          )}

          <span className="text-sm">
            Vas a pagar{" "}
            <span className="font-bold">
              {isFullPayment
                ? formatCurrency(borrowerBalance, debt.currency)
                : formatCurrency(form.watch("amount") as number, debt.currency)}
            </span>{" "}
            de <span className="font-bold">{formatCurrency(borrowerBalance, debt.currency)}</span>{" "}
          </span>

          <Dialog.Footer>
            <Button
              size="sm"
              type="submit"
              loading={addPaymentMutation.isLoading}
              disabled={borrower?.balance === 0}>
              Confirmar
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                onOpenChange(false);
              }}>
              Cancelar
            </Button>
          </Dialog.Footer>
        </Form>
      </Dialog.Content>
    </Dialog>
  );
};

export default AddPaymentDialog;

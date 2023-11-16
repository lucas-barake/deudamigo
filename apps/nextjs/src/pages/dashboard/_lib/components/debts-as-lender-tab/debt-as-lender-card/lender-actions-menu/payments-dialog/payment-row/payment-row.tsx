import React from "react";
import { Card } from "$/components/ui/card";
import { DateTime } from "luxon";
import { Badge } from "$/components/ui/badge";
import { Button } from "$/components/ui/button";
import { Popover } from "$/components/ui/popover";
import { Separator } from "$/components/ui/separator";
import { PaymentStatus } from "@prisma/client";
import toast from "react-hot-toast";
import { handleMutationError } from "$/lib/utils/handle-mutation-error";
import { type GetLenderDebtsResult, type GetPaymentsAsLenderResult } from "@deudamigo/ts-rest";
import { api } from "$/lib/configs/react-query-client";
import { useTsRestQueryClient } from "@ts-rest/react-query";
import { formatCurrency } from "@deudamigo/utils";
import { paymentStatusVariantsMap } from "$/pages/dashboard/_lib/lib/payment-status-variants-map";
import { queryClient } from "$/pages/_app.page";
import { paymentStatusMap } from "$/pages/dashboard/_lib/lib/payment-status-map";

type Props = {
  payment: GetPaymentsAsLenderResult["payments"][number];
  debt: GetLenderDebtsResult["debts"][number];
};

const PaymentRow: React.FC<Props> = ({ payment, debt }) => {
  const confirmPaymentMutation = api.debtPayments.confirmPayment.useMutation();
  const apiContext = useTsRestQueryClient(api);
  const isArchived = debt.archived !== null;

  async function handleConfirmPayment(): Promise<void> {
    await toast.promise(
      confirmPaymentMutation.mutateAsync({
        body: {
          debtId: debt.id,
          paymentId: payment.id,
          borrowerId: payment.borrower.user.id,
        },
      }),
      {
        loading: "Confirmando pago...",
        success: "Pago confirmado",
        error: handleMutationError,
      }
    );

    void queryClient.invalidateQueries(["getLenderDebts"]);

    apiContext.debtPayments.getPaymentsAsLender.setQueryData(["getLenderDebts"], (cache) => {
      if (cache === undefined) return cache;
      return {
        ...cache,
        payments: cache.body.payments.map((cachedPayment) => {
          if (cachedPayment.id !== payment.id) return cachedPayment;
          return {
            ...cachedPayment,
            status: PaymentStatus.PAID,
          };
        }),
      } satisfies GetPaymentsAsLenderResult;
    });
  }

  return (
    <Card className="mt-2 flex flex-col px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-1">
        <div className="flex flex-col">
          {payment.borrower.user.name}

          <span className="text-muted-foreground text-sm">{payment.borrower.user.email}</span>
        </div>

        <div className="text-success-text xs:flex-row xs:items-center xs:gap-1.5 flex flex-col">
          {formatCurrency(payment.amount, payment.debt.currency)}{" "}
          <span className="text-muted-foreground text-sm">
            {DateTime.fromJSDate(payment.createdAt).toLocaleString(DateTime.DATE_MED)}
          </span>
        </div>

        <Badge variant={paymentStatusVariantsMap.get(payment.status)} className="self-start">
          {paymentStatusMap.get(payment.status)}
        </Badge>
      </div>

      {payment.status === PaymentStatus.PENDING_CONFIRMATION && (
        <Popover>
          <Popover.Trigger asChild>
            <Button className="mt-4 text-sm sm:mt-0" size="sm" disabled={isArchived}>
              Confirmar Pago
            </Button>
          </Popover.Trigger>

          <Popover.Content className="flex flex-col justify-center">
            <p className="mb-2 text-center text-sm">
              ¿Estás seguro que quieres confirmar este pago? Esta acción no se puede deshacer.
            </p>

            <Separator />

            <Button
              className="mt-2 self-center text-sm"
              size="sm"
              loading={confirmPaymentMutation.isLoading}
              onClick={() => {
                void handleConfirmPayment();
              }}>
              Confirmar Pago
            </Button>
          </Popover.Content>
        </Popover>
      )}
    </Card>
  );
};

export default PaymentRow;

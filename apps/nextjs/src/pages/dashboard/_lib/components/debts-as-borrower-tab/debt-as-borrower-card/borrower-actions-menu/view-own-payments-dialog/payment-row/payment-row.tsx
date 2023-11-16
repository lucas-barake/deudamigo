import React from "react";
import { DateTime } from "luxon";
import { Badge } from "$/components/ui/badge";
import { Button } from "$/components/ui/button";
import toast from "react-hot-toast";
import { handleMutationError } from "$/lib/utils/handle-mutation-error";
import { Trash } from "lucide-react";
import { Card } from "$/components/ui/card";
import {
  contracts,
  formatCurrency,
  type GetBorrowerDebtsInput,
  type GetBorrowerDebtsResult,
  type GetPaymentsAsBorrowerResult,
} from "@deudamigo/ts-rest";
import { api } from "$/lib/configs/react-query-client";
import { useSession } from "$/lib/hooks/use-session";
import { paymentStatusVariantsMap } from "$/pages/dashboard/_lib/lib/payment-status-variants-map";
import { paymentStatusMap } from "$/pages/dashboard/_lib/lib/payment-status-map";

type Props = {
  payment: GetPaymentsAsBorrowerResult[number];
  debt: GetBorrowerDebtsResult["debts"][number];
  queryVariables: GetBorrowerDebtsInput;
};

type Result =
  | {
      success: true;
      data: unknown;
    }
  | {
      success: false;
      error: Error;
    };

const PaymentRow: React.FC<Props> = ({ payment, debt, queryVariables }) => {
  const apiContext = api.useUtils();
  const removePaymentMutation = api.debts.removePayment.useMutation();
  const session = useSession();

  async function handleRemove(): Promise<void> {
    await toast.promise(
      removePaymentMutation.mutateAsync({
        paymentId: payment.id,
        debtId: debt.id,
      }),
      {
        loading: "Eliminando pago...",
        success: "Pago eliminado",
        error: handleMutationError,
      }
    );

    apiContext.debts.getPaymentsAsBorrower.setData(
      [contracts.debts.removePayment, queryVariables],
      (cache) => {
        return cache?.filter(({ id }) => id !== payment.id) satisfies
          | GetPaymentsAsBorrowerResult
          | undefined;
      }
    );

    apiContext.debts.getSharedDebts.setData(queryVariables, (cache) => {
      if (cache === undefined) return cache;
      return {
        debts: cache.debts.map((cachedDebts) => {
          if (cachedDebts.id !== debt.id) return cachedDebts;
          return {
            ...cachedDebts,
            borrowers: cachedDebts.borrowers.map((borrower) => {
              if (borrower.user.id !== session.data?.user.id) return borrower;
              return {
                ...borrower,
                balance: borrower.balance + payment.amount,
                payments: borrower.payments.filter(({ id }) => id !== payment.id),
              };
            }),
          };
        }),
        count: cache.count,
      } satisfies GetBorrowerDebtsResult;
    });
  }

  return (
    <Card className="mt-2 flex items-center justify-between px-4 py-3">
      <div className="flex flex-col gap-1">
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

      <Button
        size="icon"
        variant="destructive"
        disabled={
          payment.status === "PAID" || payment.status === "MISSED" || debt.archived !== null
        }
        onClick={() => {
          void handleRemove();
        }}
        loading={removePaymentMutation.isLoading}>
        <Trash className="h-4 w-4" />
        <span className="sr-only">Eliminar Pago</span>
      </Button>
    </Card>
  );
};

export default PaymentRow;

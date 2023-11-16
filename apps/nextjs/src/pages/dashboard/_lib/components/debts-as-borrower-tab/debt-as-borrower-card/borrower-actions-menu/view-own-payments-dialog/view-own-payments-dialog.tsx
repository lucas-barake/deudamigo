import React from "react";
import { Dialog } from "$/components/ui/dialog";
import { TimeInMs } from "$/lib/enums/time";
import { ScrollArea } from "$/components/ui/scroll-area";
import { Loader } from "$/components/ui/loader";
import { type GetBorrowerDebtsResult } from "@deudamigo/ts-rest";
import { api } from "$/lib/configs/react-query-client";
import PaymentRow from "$/pages/dashboard/_lib/components/debts-as-lender-tab/debt-as-lender-card/lender-actions-menu/payments-dialog/payment-row";

type Props = {
  debt: GetBorrowerDebtsResult["debts"][number];
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const ViewOwnPaymentsDialog: React.FC<Props> = ({ debt, open, onOpenChange }) => {
  const query = api.debtPayments.getPaymentsAsBorrower.useQuery(
    ["getPaymentsAsBorrower"],
    {
      query: {
        debtId: debt.id,
      },
    },
    {
      enabled: open,
      cacheTime: TimeInMs.FiveSeconds,
      staleTime: TimeInMs.FiveSeconds,
      refetchOnMount: true,
      refetchOnWindowFocus: false,
    }
  );
  const payments = query.data?.body ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content>
        <Dialog.Header>
          <Dialog.Title>Pagos</Dialog.Title>

          <Dialog.Description>
            Acá podrás ver los pagos que has realizado para esta deuda.
          </Dialog.Description>
        </Dialog.Header>

        {query.isFetching ? (
          <div className="flex justify-center">
            <Loader />
          </div>
        ) : payments.length === 0 ? (
          <p className="text-center">No hay pagos para mostrar.</p>
        ) : (
          <ScrollArea className="h-[500px]">
            {payments.map((payment) => (
              <PaymentRow key={payment.id} payment={payment} debt={debt} />
            ))}
          </ScrollArea>
        )}
      </Dialog.Content>
    </Dialog>
  );
};

export default ViewOwnPaymentsDialog;

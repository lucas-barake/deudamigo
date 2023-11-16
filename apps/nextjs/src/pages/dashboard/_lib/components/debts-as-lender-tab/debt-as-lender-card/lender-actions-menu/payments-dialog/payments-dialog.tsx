import React from "react";
import { Dialog } from "$/components/ui/dialog";
import { api } from "$/lib/utils/api";
import { TimeInMs } from "$/lib/enums/time";
import { Loader } from "$/components/ui/loader";
import { ScrollArea } from "$/components/ui/scroll-area";
import { Button } from "$/components/ui/button";
import { ArrowLeft, InfoIcon } from "lucide-react";
import { PaymentStatus } from "@prisma/client";
import BorrowerRow from "$/pages/dashboard/_lib/components/debts-as-lender-tab/debt-as-lender-card/lender-actions-menu/payments-dialog/borrower-row";
import PaymentRow from "$/pages/dashboard/_lib/components/debts-as-lender-tab/debt-as-lender-card/lender-actions-menu/payments-dialog/payment-row";
import { type GetLenderDebtsInput, type GetLenderDebtsResult } from "@deudamigo/api-contracts";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  debt: GetLenderDebtsResult["debts"][number];
  queryVariables: GetLenderDebtsInput;
};

const PaymentsDialog: React.FC<Props> = ({ open, onOpenChange, debt, queryVariables }) => {
  const [selectedBorrowerId, setSelectedBorrowerId] = React.useState<string | null>(null);
  const viewingBorrower = selectedBorrowerId !== null;
  const borrowers = debt.borrowers;
  const query = api.debtPayments.getPaymentsAsLender.useQuery(
    { debtId: debt.id },
    {
      enabled: open && selectedBorrowerId !== null,
      staleTime: TimeInMs.FiveSeconds,
      cacheTime: TimeInMs.FiveSeconds,
      refetchOnWindowFocus: true,
      refetchOnMount: true,
    }
  );
  const payments = query.data?.payments ?? [];
  const descPayments = payments.sort((a, b) => {
    return b.createdAt.getTime() - a.createdAt.getTime();
  });
  const paymentsOrderedByPending = descPayments.sort((a, b) => {
    if (a.status === b.status) {
      return 0;
    }
    if (a.status === PaymentStatus.PENDING_CONFIRMATION) {
      return -1;
    }
    if (b.status === PaymentStatus.PENDING_CONFIRMATION) {
      return 1;
    }
    return 0;
  });
  const filteredPayments = paymentsOrderedByPending.filter(
    (payment) => payment.borrower.user.id === selectedBorrowerId
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        setSelectedBorrowerId(null);
        onOpenChange(newOpen);
      }}>
      <Dialog.Content>
        <Dialog.Header>
          <Dialog.Title>Pagos</Dialog.Title>

          <Dialog.Description>
            Aquí se mostrarán los pagos realizados por los deudores. También podrás confirmar los
            pagos que te hagan.
          </Dialog.Description>
        </Dialog.Header>

        {borrowers.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2">
            <InfoIcon className="text-primary h-8 w-8" />
            <p className="text-center">No hay deudores para mostrar.</p>
          </div>
        )}

        {!viewingBorrower && (
          <div className="flex flex-col gap-1.5">
            {borrowers.map((borrower) => (
              <BorrowerRow
                key={borrower.user.id}
                setSelectedBorrowerId={setSelectedBorrowerId}
                borrower={borrower}
                currency={debt.currency}
              />
            ))}
          </div>
        )}

        {viewingBorrower && (
          <React.Fragment>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSelectedBorrowerId(null);
              }}>
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Volver
            </Button>

            <ScrollArea className="h-[500px]">
              {query.isFetching ? (
                <div className="flex items-center justify-center">
                  <Loader />
                </div>
              ) : filteredPayments.length === 0 ? (
                <p className="text-center">No hay pagos para mostrar.</p>
              ) : (
                <React.Fragment>
                  {filteredPayments.map((payment) => (
                    <PaymentRow
                      payment={payment}
                      debt={debt}
                      queryVariables={queryVariables}
                      key={payment.id}
                    />
                  ))}
                </React.Fragment>
              )}
            </ScrollArea>
          </React.Fragment>
        )}
      </Dialog.Content>
    </Dialog>
  );
};

export default PaymentsDialog;

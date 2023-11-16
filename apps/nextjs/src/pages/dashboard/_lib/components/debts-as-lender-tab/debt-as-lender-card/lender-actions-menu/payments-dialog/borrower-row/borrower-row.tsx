import React from "react";
import { Card } from "$/components/ui/card";
import { Button } from "$/components/ui/button";
import { EyeIcon } from "lucide-react";
import { PaymentStatus } from "@prisma/client";
import DebtCard from "$/pages/dashboard/_lib/components/debt-card";
import { formatCurrency } from "@deudamigo/utils";
import { type GetLenderDebtsResult } from "@deudamigo/api-contracts";

type Props = {
  setSelectedBorrowerId: React.Dispatch<React.SetStateAction<string | null>>;
  borrower: GetLenderDebtsResult["debts"][number]["borrowers"][number];
  currency: string;
};

const BorrowerRow: React.FC<Props> = ({ setSelectedBorrowerId, borrower, currency }) => {
  const pendingConfirmation = borrower.payments.some(
    (payment) => payment.status === PaymentStatus.PENDING_CONFIRMATION
  );
  return (
    <Card
      key={borrower.user.id}
      className="flex flex-col justify-between gap-2 px-3 py-2 text-sm sm:flex-row sm:items-center">
      <div className="flex items-center gap-2">
        <DebtCard.MemberAvatar
          image={borrower.user.image}
          fallback={borrower.user.name?.at(0) ?? borrower.user.email?.at(0) ?? "?"}
        />

        <div className="flex flex-col">
          <span className="flex items-center gap-2">{borrower.user.name}</span>

          <span className="text-muted-foreground break-all text-sm">{borrower.user.email}</span>

          <span className="text-warning-text text-sm">
            Saldo: {formatCurrency(borrower.balance, currency)}
          </span>
        </div>
      </div>

      <Button
        variant={pendingConfirmation ? "highlight" : "default"}
        size="sm"
        className="text-sm"
        onClick={() => {
          setSelectedBorrowerId(borrower.user.id);
        }}>
        <EyeIcon className="mr-1.5 h-4 w-4" />
        Ver Pagos
      </Button>
    </Card>
  );
};

export default BorrowerRow;

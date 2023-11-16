import React from "react";
import { Popover } from "$/components/ui/popover";
import { Button } from "$/components/ui/button";
import * as LucideIcons from "lucide-react";
import { Avatar } from "$/components/ui/avatar";
import { type Currency } from "$/server/api/routers/recurrent-debts/mutations/input";
import { type GetDebtBorrowersAndPendingBorrowersResult } from "$/server/api/routers/recurrent-debts/queries/types";

type Props = {
  borrower: GetDebtBorrowersAndPendingBorrowersResult["borrowers"][number];
  currency: Currency;
};

const BorrowerRow: React.FC<Props> = ({ borrower }) => {
  return (
    <div className="flex items-center justify-between" key={borrower.user.id}>
      <div className="flex items-center gap-3">
        <Popover>
          <Popover.Trigger asChild>
            <Button variant="outline" className="group relative">
              <span className="sr-only">Ver información del deudor</span>

              <Avatar className="h-6 w-6">
                <Avatar.Image src={borrower.user.image ?? undefined} />

                <Avatar.Fallback>{borrower.user.name?.[0] ?? "?"}</Avatar.Fallback>
              </Avatar>

              <span className="text-foreground xs:max-w-[200px] ml-2 max-w-[150px] truncate sm:max-w-[250px]">
                {borrower.user.name ?? "Sin nombre"}
              </span>
            </Button>
          </Popover.Trigger>

          <Popover.Content className="flex flex-col gap-2" align="start">
            <div className="text-foreground flex flex-col gap-1">
              <span>{borrower.user.name ?? "Sin nombre"}</span>
              <span className="break-all opacity-50">{borrower.user.email}</span>
            </div>
          </Popover.Content>
        </Popover>
      </div>

      <Popover>
        <Popover.Trigger asChild>
          <Button size="sm" variant="secondary" className="opacity-50">
            <LucideIcons.UserMinus className="h-5 w-5 sm:mr-1.5" />
            <span className="sr-only sm:not-sr-only">Eliminar</span>
          </Button>
        </Popover.Trigger>

        <Popover.Content>
          <p className="text-foreground text-sm">
            No puedes eliminar a un deudor que ya ha aceptado la invitación.
          </p>
        </Popover.Content>
      </Popover>
    </div>
  );
};

export default BorrowerRow;

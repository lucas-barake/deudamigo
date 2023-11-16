import React from "react";
import { PaymentStatus } from "@prisma/client";
import { Button } from "$/components/ui/button";
import { Popover } from "$/components/ui/popover";
import { useSession } from "$/lib/hooks/use-session";
import { type GetLenderDebtsResult } from "@deudamigo/ts-rest";
import DebtCard from "$/pages/dashboard/_lib/components/debt-card";
import BorrowerActionsMenu from "$/pages/dashboard/_lib/components/debts-as-borrower-tab/debt-as-borrower-card/borrower-actions-menu";

type Props = {
  debt: GetLenderDebtsResult["debts"][number];
};
const DebtAsBorrowerCard: React.FC<Props> = ({ debt }) => {
  const session = useSession();
  const borrower = debt.borrowers.find(({ user }) => user.email === session.user?.email);
  if (borrower === undefined) return null;
  const isDebtPaid =
    borrower.balance === 0 &&
    borrower.payments.every(({ status }) => status === PaymentStatus.PAID);
  const isDebtConcluded = isDebtPaid || debt.archived !== null;

  return (
    <DebtCard isConcluded={isDebtConcluded}>
      <DebtCard.Header>
        <DebtCard.Title>{debt.name}</DebtCard.Title>

        <DebtCard.AvatarContainer>
          <Popover>
            <Popover.Trigger asChild>
              <Button variant="ghost" className="h-10 px-2">
                <DebtCard.MemberAvatar
                  image={debt.lender.image}
                  fallback={
                    debt.lender.name?.[0]?.toUpperCase() ??
                    debt.lender.email?.[0]?.toUpperCase() ??
                    "?"
                  }
                />
              </Button>
            </Popover.Trigger>

            <Popover.Content align="end" className="w-60">
              <div className="flex flex-col gap-2">
                <span className="text-sm font-bold">{debt.lender.name ?? debt.lender.email}</span>

                <span className="text-foreground/50 text-xs">{debt.lender.email}</span>
              </div>
            </Popover.Content>
          </Popover>
        </DebtCard.AvatarContainer>
      </DebtCard.Header>

      <DebtCard.BadgeContainer>
        <DebtCard.AmountBadge amount={borrower.balance} currency={debt.currency} />

        <DebtCard.PayUntilRecurrenceBadge
          recurringFrequency={debt.recurringFrequency}
          duration={debt.duration}
          createdAt={debt.createdAt}
        />

        <DebtCard.RecurringFrequencyBadge
          recurringFrequency={debt.recurringFrequency}
          duration={debt.duration}
        />
      </DebtCard.BadgeContainer>

      <DebtCard.Description>{debt.description}</DebtCard.Description>

      <DebtCard.Footer>
        <div className="flex flex-col gap-1.5">
          <DebtCard.CreatedAtBadge createdAt={debt.createdAt} />

          <DebtCard.DueDateBadge
            dueDate={debt.dueDate}
            recurringFrequency={debt.recurringFrequency}
            createdAt={debt.createdAt}
            duration={debt.duration}
          />
        </div>

        <BorrowerActionsMenu debt={debt} isConcluded={isDebtConcluded} />
      </DebtCard.Footer>
    </DebtCard>
  );
};

export default DebtAsBorrowerCard;

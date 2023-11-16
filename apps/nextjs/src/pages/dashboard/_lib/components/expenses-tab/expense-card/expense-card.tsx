import React from "react";
import DebtCard from "$/pages/dashboard/_lib/components/debt-card";
import ActionsMenu from "$/pages/dashboard/_lib/components/expenses-tab/expense-card/actions-menu/actions-menu";

type Props = {
  expense: GetPersonalExpensesResult["expenses"][number];
};

const ExpenseCard: React.FC<Props> = ({ expense }) => {
  return (
    <DebtCard isConcluded={false}>
      <DebtCard.Header>
        <DebtCard.Title>{expense.name}</DebtCard.Title>
      </DebtCard.Header>

      <DebtCard.BadgeContainer>
        <DebtCard.AmountBadge amount={expense.amount} currency={expense.currency} />
      </DebtCard.BadgeContainer>

      <DebtCard.Description>{expense.description}</DebtCard.Description>

      <DebtCard.Footer>
        <DebtCard.CreatedAtBadge createdAt={expense.createdAt} label="Creado" />

        <ActionsMenu expense={expense} />
      </DebtCard.Footer>
    </DebtCard>
  );
};

export default ExpenseCard;

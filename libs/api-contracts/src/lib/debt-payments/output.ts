import { type Borrower, type Debt, type Payment, type User } from "@deudamigo/database";

export type AddPaymentResult = {
  newPaymentId: string;
  newBalance: number;
  amount: number;
};

export type RemovePaymentResult = {
  paymentId: string;
  debtId: string;
};

export type ConfirmPaymentResult = {
  paymentId: string;
  debtId: string;
};

export type GetPaymentsAsBorrowerResult = Array<{
  id: Payment["id"];
  status: Payment["status"];
  amount: Payment["amount"];
  createdAt: Payment["createdAt"];
  debt: {
    currency: Debt["currency"];
  };
}>;

export type GetPaymentsAsLenderResult = {
  payments: Array<{
    status: Payment["status"];
    amount: Payment["amount"];
    debt: { currency: Debt["currency"] };
    borrower: {
      user: { id: User["id"]; name: User["name"]; email: User["email"]; image: User["image"] };
      balance: Borrower["balance"];
    };
    id: Payment["id"];
    createdAt: Payment["createdAt"];
  }>;
};

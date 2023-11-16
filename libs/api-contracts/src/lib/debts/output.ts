import { type GetUserDebts } from "./types";
import { type Debt, type PendingInvite, type User } from "@deudamigo/database";

export type CreateDebtResult = GetUserDebts;

export type ArchiveDebtResult = {
  id: Debt["id"];
};

export type GetPartnersResult = Array<{
  email: User["email"];
  image: User["image"];
  name: User["name"];
}>;

export type GetLenderDebtsResult = {
  debts: GetUserDebts[];
  count: number;
};

export type GetBorrowerDebtsResult = {
  debts: GetUserDebts[];
  count: number;
};

export type GetDebtBorrowersAndPendingBorrowersResult = {
  borrowers: Array<{
    user: {
      name: User["name"];
      id: User["id"];
      email: User["email"];
      image: User["image"];
    };
    balance: Debt["amount"];
  }>;
  pendingBorrowers: Array<{
    inviteeEmail: PendingInvite["inviteeEmail"];
  }>;
};

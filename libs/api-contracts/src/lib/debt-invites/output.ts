export type SendDebtInviteResult = {
  inviteeEmail: string;
  debt: {
    id: string;
    name: string;
  };
};

export type RemoveDebtInviteResult = {
  debtId: string;
  inviteeEmail: string;
};

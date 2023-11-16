import { type $Enums } from "@prisma/client";

export type User = {
  email: string | null;
  name: string | null;
  image: string | null;
  activeSubscription: {
    type: "BASIC";
    status: $Enums.SubscriptionStatus;
    nextDueDate: Date;
    startDate: Date;
    endDate: Date;
  } | null;
};

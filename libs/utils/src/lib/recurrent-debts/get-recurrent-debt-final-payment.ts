import { DateTime } from "luxon";
import { DebtRecurringFrequency } from "@deudamigo/database";

type Args = {
  createdAt: string;
  duration: number;
  recurringFrequency: DebtRecurringFrequency;
};

export function getRecurrentDebtFinalPayment(args: Args): DateTime {
  return DateTime.fromISO(args.createdAt).plus({
    ...(args.recurringFrequency === DebtRecurringFrequency.MONTHLY && {
      month: args.duration,
    }),
    ...(args.recurringFrequency === "WEEKLY" && {
      day: args.duration * 7,
    }),
    ...(args.recurringFrequency === "BIWEEKLY" && {
      day: args.duration * 14,
    }),
  });
}

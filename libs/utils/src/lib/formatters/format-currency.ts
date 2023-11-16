export const CURRENCIES = [
  "COP",
  "USD",
  "MXN",
  "EUR",
  "UYU",
  "ARS",
  "CLP",
  "BRL",
  "PYG",
  "PEN",
  "GBP",
] as const;
export type Currency = (typeof CURRENCIES)[number] | string;

export function formatCurrency(value: number, currency?: Currency): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: currency ?? "COP",
  }).format(value);
}

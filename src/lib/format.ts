import { format } from "date-fns";

export function formatCurrency(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(value: string | Date, pattern = "MMM d, yyyy") {
  return format(new Date(value), pattern);
}

export function formatMonthLabel(monthKey: string) {
  return format(new Date(`${monthKey}-01T00:00:00.000Z`), "MMMM yyyy");
}

export function formatPercent(value: number) {
  return `${value}%`;
}

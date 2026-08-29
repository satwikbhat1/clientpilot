import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: Date | string | undefined | null): string {
  if (date === undefined || date === null || date === "") return "—";
  try {
    const d: Date = typeof date === "string" ? new Date(date) : date;
    if (Number.isNaN(d.getTime())) {
      // Not a parseable ISO/timestamp — treat as a human-friendly label (e.g. "Next Monday")
      return String(date);
    }
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(d);
  } catch (e) {
    return String(date);
  }
}

export function generateId() {
  return Math.random().toString(36).substring(2, 15);
}

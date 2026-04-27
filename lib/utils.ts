import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(value);
}

export function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

export function toNumber(value: unknown, fallback = 0) {
  if (typeof value === "number") return Number.isFinite(value) ? value : fallback;
  if (typeof value === "object" && value !== null) {
    const decimalLike = value as { toNumber?: () => number; toString?: () => string };
    if (typeof decimalLike.toNumber === "function") {
      const parsed = decimalLike.toNumber();
      return Number.isFinite(parsed) ? parsed : fallback;
    }
    if (typeof decimalLike.toString === "function") {
      const parsed = Number(decimalLike.toString());
      return Number.isFinite(parsed) ? parsed : fallback;
    }
  }
  if (typeof value !== "string") return fallback;
  const normalized = value.replace(/[$,%\s]/g, "").replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : fallback;
}

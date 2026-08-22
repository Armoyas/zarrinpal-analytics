import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format an Iranian rial (IRR) amount into a human-readable Persian string.
 * e.g. 5000000 → "5,000,000 ریال"
 */
export function formatRial(amount: number | null | undefined): string {
  if (amount == null || isNaN(amount)) return "—";
  const rounded = Math.round(amount);
  return `${rounded.toLocaleString("fa-IR")} ریال`;
}

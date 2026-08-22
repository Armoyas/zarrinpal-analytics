import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Persian (Farsi) number formatting
const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹"
const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩"

export function toPersianNumber(num: number | string): string {
  return num
    .toString()
    .replace(/\d/g, (d) => PERSIAN_DIGITS[parseInt(d)])
}

export function formatCurrency(amount: number): string {
  const formatted = new Intl.NumberFormat("fa-IR").format(amount)
  return toPersianNumber(formatted)
}

export function formatPercent(value: number): string {
  return toPersianNumber((value * 100).toFixed(1)) + "٪"
}

export function formatDate(date: string): string {
  const d = new Date(date)
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Tehran",
  }
  return new Intl.DateTimeFormat("fa-IR", options).format(d)
}

// Risk score color
export function getRiskColor(score: number): string {
  if (score >= 8) return "text-red-500 bg-red-500/10"
  if (score >= 5) return "text-amber-500 bg-amber-500/10"
  return "text-green-500 bg-green-500/10"
}

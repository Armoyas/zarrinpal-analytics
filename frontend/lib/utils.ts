import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatRials(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) return '—'
  return new Intl.NumberFormat('fa-IR').format(Math.round(value))
}

export function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) return '—'
  return new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 1 }).format(value) + '٪'
}

export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) return '—'
  return new Intl.NumberFormat('fa-IR').format(value)
}

/** Compact "میلیون/میلیارد" for chart axes — e.g. 1.2m → «۱٫۲ م» */
export function formatCompactRials(value: number): string {
  if (value >= 1_000_000_000) {
    return new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 1 }).format(value / 1_000_000_000) + ' م'
  }
  if (value >= 1_000_000) {
    return new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 1 }).format(value / 1_000_000) + ' م'
  }
  if (value >= 1_000) {
    return new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 1 }).format(value / 1_000) + ' ه'
  }
  return new Intl.NumberFormat('fa-IR').format(value)
}

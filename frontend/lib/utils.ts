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

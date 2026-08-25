"use client"

import { AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

interface Limitation {
  id: string
  title: string
  description: string
}

const LIMITATIONS: Limitation[] = [
  {
    id: "adjusted-fee",
    title: "کارمزد تنظیم‌شده (adjusted_fee)",
    description: "این مقدار یک شاخص نسبی است، نه کارمزد واقعی زرین‌پال. تنها برای مقایسه نسبی بین فروشگاه‌ها معتبر است.",
  },
  {
    id: "settled-at",
    title: "تسویه حساب (settled_at)",
    description: "ستون settled_at برای ۹۸.۹۵٪ ردیف‌ها NULL است. تحلیل‌های مبتنی بر تسویه در دسترس نیستند.",
  },
  {
    id: "payer-card",
    title: "کارت پرداخت‌کننده (payer_card_key)",
    description: "۹۴٪ ردیف‌ها دارای مقدار NULL هستند. تحلیل رفتارهای تکراری قابل اعتماد نیست.",
  },
  {
    id: "no-customer-product",
    title: "عدم وجود شناسه مشتری/محصول",
    description: "ستون‌های customer_id و product_id وجود ندارند. تحلیل مشتریان، محصولات و نگهداری پشتیبانی نمی‌شود.",
  },
]

export function DataLimitationWarning({
  compact = false,
  className,
}: {
  compact?: boolean
  className?: string
}) {
  const warningCount = LIMITATIONS.length

  if (compact) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-2 text-xs",
          className
        )}
      >
        <AlertTriangle className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
        <span className="text-amber-200">
          {warningCount} محدودیت داده —{" "}
          <span className="underline underline-offset-1">جزئیات</span>
        </span>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "rounded-lg border border-amber-500/20 bg-amber-500/5 p-4 space-y-3",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-medium text-amber-200">
            محدودیت‌های داده — {warningCount} مورد
          </p>
          <p className="text-sm text-muted-foreground">
            این داشبورد بر روی داده‌های نمونه‌ای با محدودیت‌های شناخته‌شده ساخته شده
            است. لطفاً قبل از تصمیم‌گیری، این موارد را در نظر بگیرید.
          </p>
        </div>
      </div>
      <div className="grid gap-2.5 pt-2 border-t border-amber-500/20">
        {LIMITATIONS.map((lim) => (
          <div key={lim.id} className="flex items-start gap-2">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500/70 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-amber-200">{lim.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {lim.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

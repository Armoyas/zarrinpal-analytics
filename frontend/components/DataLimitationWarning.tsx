"use client"

import { AlertTriangle } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface DataLimitationWarningProps {
  compact?: boolean
}

export function DataLimitationWarning({ compact = false }: DataLimitationWarningProps) {
  const limitations = [
    "داده‌ها شامگل نمونه اولیه (demo data) هستند و ممکن است دقیق نباشند",
    "تراکنش‌ها شامگل تاریخچه 30 روز اخیر هستند",
    "هزینه‌های adjusted_fee شام حاوی اطلاعات حسابرسی شده نیستند و صرفاً نمایش داده شده‌اند",
    "دسته‌بندی‌ها ممکن است ناقص یا غیرهمگن باشند",
    "آمار لحظه‌ای است و ممکن است تا 24 ساعت تاخیر داشته باشد",
  ]

  const content = (
    <div className={cn(
      "flex items-center gap-2 text-sm text-amber-700 dark:text-amber-300",
      compact ? "p-2" : "p-3"
    )}>
      <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
      <span>
        <strong className="font-medium">هشدار محدودیت داده:</strong>{" "}
        این داده‌ها نمایشی از قابلیت‌های تحلیلی هستند.
      </span>
    </div>
  )

  if (compact) return content

  return (
    <div className="bg-amber-50/50 border border-amber-200 rounded-lg p-3 mb-4 dark:bg-amber-950/20 dark:border-amber-900/30">
      <div className="flex items-start gap-2">
        <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="flex-1">
          <div className="font-medium text-amber-800 dark:text-amber-200 mb-1">
            هشدار محدودیت داده
          </div>
          <p className="text-sm text-amber-700 dark:text-amber-300">
            این داده‌ها نمایشی از قابلیت‌های تحلیلی هستند و شامل نمونه اولیه (demo data) می‌باشند.
          </p>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <AlertTriangle className="h-3 w-3 text-amber-600 cursor-help inline-block ml-1" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <ul className="text-xs space-y-1">
                  {limitations.map((l, i) => (
                    <li key={i}>• {l}</li>
                  ))}
                </ul>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  )
}

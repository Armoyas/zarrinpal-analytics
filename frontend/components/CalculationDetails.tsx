"use client"

import { useState } from "react"
import { X, HelpCircle } from "lucide-react"
import { Dialog } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface CalculationDetailsProps {
  open?: boolean
  onClose?: () => void
  merchantKey?: string | null
  metricType?: string
  showTooltip?: boolean
}

interface CalculationStep {
  step: string
  description: string
  formula?: string
  value?: string | number
}

const calculations: Record<string, CalculationStep[]> = {
  "adjusted-fee": [
    {
      step: "1. محاسبه کارکرد",
      description: "کارکرد کل تراکنش‌های موفق (Paid + Verified) محاسبه می‌شود",
      formula: "fee = Σ(amount × rate)",
    },
    {
      step: "2. اعمال نرخ پیش‌فرض",
      description: "نرخ پیش‌فرض 0.72% (7200 ریال برای 1,000,000 ریال) به کار می‌رود",
      formula: "rate = 0.0072",
    },
    {
      step: "3. هشدار هزینه تنظیم‌شده",
      description: "مقادیر adjusted_fee می‌توانند شامل هزینه‌های مختلف (کارت، درگاه، صیغه) باشند",
      formula: "adjusted_fee = fee × multiplier",
    },
  ],
  "high-value": [
    {
      step: "1. تعیین آستانه",
      description: "تراکنش‌های با amount بزرگتر از آستانه تنظیم‌شده شناسایی می‌شوند",
      formula: "threshold = configurable (default: 50,000,000 IRR)",
    },
    {
      step: "2. رصد رفتار",
      description: "الگوهای غیرعادی در زمان یا الگوی پرداخت شناسایی می‌شوند",
      formula: "anomaly_score = statistical_deviation(amount, timing)",
    },
  ],
  "sales-share": [
    {
      step: "1. محاسبه کل فروش",
      description: "مجموع amount تراکنش‌های موفق در بازه زمانی",
      formula: "total_sales = Σ(amount) WHERE session_status = Paid",
    },
    {
      step: "2. درصت‌سنجی دسته",
      description: "سهم هر دسته از کل فروش محاسبه می‌شود",
      formula: "share = (category_sales / total_sales) × 100",
    },
  ],
}

export function CalculationDetails({
  open,
  onClose,
  merchantKey,
  metricType = "adjusted-fee",
  showTooltip = false,
}: CalculationDetailsProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isOpen = open ?? internalOpen
  const setIsOpen = onClose ?? setInternalOpen

  const steps = calculations[metricType] || calculations["adjusted-fee"]

  const dialogContent = (
    <>
      <div className="space-y-4 max-h-80 overflow-y-auto">
        {steps.map((step, i) => (
          <div key={i} className="border rounded-lg p-3 space-y-1">
            <h3 className="font-medium text-sm">{step.step}</h3>
            <p className="text-xs text-muted-foreground">{step.description}</p>
            {step.formula && (
              <code className="text-xs bg-muted px-2 py-1 rounded block">
                {step.formula}
              </code>
            )}
            {step.value && (
              <div className="text-xs font-medium text-right">
                مقدار: {step.value}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-6 flex justify-end">
        <Button variant="outline" size="sm" onClick={() => setIsOpen(false)}>
          <X className="h-3 w-3 ml-1" />
          بستن
        </Button>
      </div>
    </>
  )

  if (showTooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(true)}>
              <HelpCircle className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs text-xs">
            جزئیات محاسبه تمام متریک‌های این صفحه نمایش داده می‌شود.
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <>
      {dialogContent}
      <Dialog open={isOpen} onOpenChange={setIsOpen} title="جزئیات محاسبه" description={merchantKey ? `فروشگاه: ${merchantKey}` : undefined}>
        {dialogContent}
      </Dialog>
    </>
  )
}

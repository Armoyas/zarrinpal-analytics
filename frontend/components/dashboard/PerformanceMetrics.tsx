'use client'

import { useEffect, useState } from 'react'
import { Wallet, CheckCircle2, Percent, CalendarDays, TrendingUp, HelpCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { api, type OverviewMetrics } from '@/lib/api'
import { formatRials, formatPercent } from '@/lib/utils'

interface Kpi {
  title: string
  value: string
  hint: string
  icon: React.ElementType
  iconClass: string
  howCalculated?: string
}

export function PerformanceMetrics() {
  const [data, setData] = useState<OverviewMetrics | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.overview()
      .then(setData)
      .catch((e) => setError(e.message))
  }, [])

  const getKpi = (key: string, label: string, hint: string, icon: React.ElementType, iconClass: string): Kpi => {
    const calc = data?.how_calculated?.[key]
    return {
      title: label,
      value: '—',
      hint,
      icon,
      iconClass,
      howCalculated: calc,
    }
  }

  const kpis: Kpi[] = [
    {
      title: 'حجم تراکنش',
      value: data ? formatRials(data.amount.total_rials) : '—',
      hint: data ? data.amount.currency : 'ریال',
      icon: Wallet,
      iconClass: 'bg-blue-100 text-blue-700',
      howCalculated: data?.how_calculated?.total_amount,
    },
    {
      title: 'تعداد تلاش',
      value: data ? new Intl.NumberFormat('fa-IR').format(data.total_attempts) : '—',
      hint: 'تلاش پرداخت',
      icon: TrendingUp,
      iconClass: 'bg-indigo-100 text-indigo-700',
      howCalculated: data?.how_calculated?.total_attempts,
    },
    {
      title: 'نرخ موفقیت',
      value: data ? formatPercent(data.success_rate) : '—',
      hint: 'Verified+Paid / کل',
      icon: CheckCircle2,
      iconClass: 'bg-emerald-100 text-emerald-700',
      howCalculated: data?.how_calculated?.success_rate,
    },
    {
      title: 'سهم کارمزد',
      value: data ? formatPercent((data.adjusted_fee_total / data.amount.total_rials) * 100) : '—',
      hint: 'adjust. fee / حجم — نسبی',
      icon: Percent,
      iconClass: 'bg-amber-100 text-amber-700',
      howCalculated: 'SUM(adjusted_fee) / SUM(amount) * 100 — نسبی فقط (کارمزد تنظیم شده)',
    },
    {
      title: 'روزهای فعال',
      hint: 'روز',
      icon: CalendarDays,
      iconClass: 'bg-rose-100 text-rose-700',
      value: data ? new Intl.NumberFormat('fa-IR').format(data.payment_attempts.total - data.payment_attempts.failed) : '—',
    },
  ]

  return (
    <div>
      <h2 className="mb-3 text-lg font-bold">نمای کلی پذیرنده</h2>
      <TooltipProvider>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {kpis.map((kpi) => (
            <Card key={kpi.title} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-sm font-medium text-muted-foreground">
                  <span className={`rounded-md p-1.5 ${kpi.iconClass}`}>
                    <kpi.icon className="h-4 w-4" />
                  </span>
                  {kpi.title}
                  {kpi.howCalculated && (
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-3 w-3 text-muted-foreground/50" />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs text-xs">
                        {kpi.howCalculated}
                      </TooltipContent>
                    </Tooltip>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!data && !error ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <>
                    <div className="text-xl font-bold sm:text-2xl" dir="ltr">{kpi.value}</div>
                    <p className="mt-1 text-xs text-muted-foreground">{kpi.hint}</p>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </TooltipProvider>
      {error && <p className="mt-2 text-sm text-destructive">خطا در دریافت داده‌ها: {error}</p>}
    </div>
  )
}

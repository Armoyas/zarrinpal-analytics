'use client'

import { useEffect, useState } from 'react'
import { Wallet, TrendingUp, CheckCircle2, Percent, Fingerprint, HelpCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { api, type OverviewMetrics } from '@/lib/api'
import { formatRials, formatNumber, formatPercent } from '@/lib/utils'

interface Kpi {
  key: string
  title: string
  value: string
  hint: string
  icon: React.ElementType
  iconClass: string
  status?: { label: string; variant: 'success' | 'warning' | 'destructive' }
  howCalculated?: string
}

export function PerformanceMetrics() {
  const [data, setData] = useState<OverviewMetrics | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api
      .overview()
      .then(setData)
      .catch((e) => setError(e.message))
  }, [])

  const feeShare = data ? (data.adjusted_fee_total / data.amount.total_rials) * 100 : null

  const kpis: Kpi[] = [
    {
      key: 'total_amount',
      title: 'حجم تراکنش',
      value: data ? formatRials(data.amount.total_rials) : '—',
      hint: data ? `${data.amount.currency} · مجموع مبلغ` : 'ریال',
      icon: Wallet,
      iconClass: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
      howCalculated: data?.how_calculated?.total_amount,
    },
    {
      key: 'total_attempts',
      title: 'تعداد تلاش پرداخت',
      value: data ? formatNumber(data.total_attempts) : '—',
      hint: 'تلاش پرداخت ثبت‌شده',
      icon: TrendingUp,
      iconClass: 'bg-teal-500/15 text-teal-600 dark:text-teal-400',
      howCalculated: data?.how_calculated?.total_attempts,
    },
    {
      key: 'success_rate',
      title: 'نرخ موفقیت',
      value: data ? formatPercent(data.success_rate) : '—',
      hint: 'Verified + Paid / کل تلاش‌ها',
      icon: CheckCircle2,
      iconClass: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
      status: data
        ? data.success_rate >= 90
          ? { label: 'عالی', variant: 'success' }
          : data.success_rate >= 70
            ? { label: 'قابل قبول', variant: 'warning' }
            : { label: 'نیازمند توجه', variant: 'destructive' }
        : undefined,
      howCalculated: data?.how_calculated?.success_rate,
    },
    {
      key: 'fee_share',
      title: 'سهم کارمزد',
      value: feeShare !== null ? formatPercent(feeShare) : '—',
      hint: 'تنها برای مقایسه نسبی معتبر است',
      icon: Percent,
      iconClass: 'bg-orange-500/15 text-orange-600 dark:text-orange-400',
      howCalculated: 'SUM(adjusted_fee) / SUM(amount) × 100 — نسبی فقط (کارمزد تنظیم‌شده)',
    },
    {
      key: 'unique_sessions',
      title: 'نشست‌های یکتا',
      value: data ? formatNumber(data.unique_sessions) : '—',
      hint: 'نشست پرداخت منحصربه‌فرد',
      icon: Fingerprint,
      iconClass: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400',
      howCalculated: data?.how_calculated?.unique_sessions,
    },
  ]

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-bold">شاخص‌های کلیدی عملکرد</h3>
        {error && <p className="text-xs text-destructive">خطا در دریافت داده‌ها</p>}
      </div>
      <TooltipProvider>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {kpis.map((kpi) => (
            <Card key={kpi.key} className="card-hover overflow-hidden bg-gradient-to-b from-primary/[0.06] to-card">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardDescription className="font-medium text-muted-foreground">{kpi.title}</CardDescription>
                  <div className="flex items-center gap-1.5">
                    {kpi.status && <Badge variant={kpi.status.variant}>{kpi.status.label}</Badge>}
                    {kpi.howCalculated && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button className="text-muted-foreground/40 transition-colors hover:text-primary">
                            <HelpCircle className="h-3.5 w-3.5" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                          {kpi.howCalculated}
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-1">
                {!data && !error ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <div className="num text-2xl font-extrabold leading-tight tracking-tight" dir="ltr">
                    {kpi.value}
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-0">
                <div className="flex items-center gap-2">
                  <span className={`rounded-lg p-1.5 ${kpi.iconClass}`}>
                    <kpi.icon className="h-4 w-4" />
                  </span>
                  <p className="truncate text-xs text-muted-foreground">{kpi.hint}</p>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </TooltipProvider>
    </div>
  )
}

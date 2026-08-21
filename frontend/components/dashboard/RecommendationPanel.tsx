'use client'

import { useEffect, useState } from 'react'
import { Lightbulb, AlertTriangle, CheckCircle2, Coins } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { api, type OverviewMetrics } from '@/lib/api'
import { formatPercent, formatNumber, formatRials } from '@/lib/utils'

interface Insight {
  icon: React.ElementType
  tone: 'success' | 'warning' | 'info'
  title: string
  desc: string
  metric: string
}

export function RecommendationPanel() {
  const [data, setData] = useState<OverviewMetrics | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api
      .overview()
      .then(setData)
      .catch((e) => setError(e.message))
  }, [])

  const insights: Insight[] = data
    ? [
        data.success_rate >= 90
          ? {
              icon: CheckCircle2,
              tone: 'success' as const,
              title: 'نرخ موفقیت در وضعیت سالم',
              desc: 'نرخ موفقیت فعلی بالای ۹۰٪ است و در محدوده مطلوب قرار دارد.',
              metric: formatPercent(data.success_rate),
            }
          : {
              icon: AlertTriangle,
              tone: 'warning' as const,
              title: 'بهبود نرخ موفقیت',
              desc: 'نرخ موفقیت زیر ۹۰٪ است؛ بررسی تراکنش‌های ناموفق می‌تواند نرخ را افزایش دهد.',
              metric: formatPercent(data.success_rate),
            },
        data.payment_attempts.failed > 0
          ? {
              icon: AlertTriangle,
              tone: 'warning' as const,
              title: 'تراکنش‌های ناموفق',
              desc: 'تلاش‌های پرداخت ناموفق ثبت شده است؛ بررسی کدهای خطا (switch_response_code) پیشنهاد می‌شود.',
              metric: formatNumber(data.payment_attempts.failed),
            }
          : {
              icon: CheckCircle2,
              tone: 'success' as const,
              title: 'بدون تلاش ناموفق',
              desc: 'هیچ تلاش پرداخت ناموفقی ثبت نشده است.',
              metric: '۰',
            },
        {
          icon: Coins,
          tone: 'info' as const,
          title: 'میانگین مبلغ هر تلاش',
          desc: 'میانگین ارزش هر تلاش پرداخت، معیاری برای ارزش سبد تراکنش‌های شماست.',
          metric: formatRials(data.amount.avg_per_attempt_rials),
        },
      ]
    : []

  const toneStyles: Record<Insight['tone'], string> = {
    success: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
    warning: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    info: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400',
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-amber-500" />
          پیشنهادهای هوشمند
        </CardTitle>
        <CardDescription>بینش‌های قابل اقدام بر اساس داده‌های فعلی</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2.5">
        {!data && !error ? (
          <>
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </>
        ) : error ? (
          <p className="text-sm text-muted-foreground">داده‌ای برای نمایش در دسترس نیست.</p>
        ) : (
          insights.map((ins) => (
            <div
              key={ins.title}
              className="group flex items-start gap-3 rounded-xl border bg-muted/30 p-3 transition-colors hover:bg-muted/60"
            >
              <span className={`mt-0.5 rounded-lg p-2 ${toneStyles[ins.tone]}`}>
                <ins.icon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold">{ins.title}</p>
                  <Badge variant="outline" className="shrink-0">
                    <span className="num">{ins.metric}</span>
                  </Badge>
                </div>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{ins.desc}</p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}

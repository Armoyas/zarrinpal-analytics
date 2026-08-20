'use client'

import { useEffect, useState } from 'react'
import { Wallet, CheckCircle2, Percent, CalendarDays, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { api, type MerchantSummary } from '@/lib/api'
import { formatRials, formatPercent } from '@/lib/utils'

interface Kpi {
  title: string
  value: string
  hint: string
  icon: React.ElementType
  iconClass: string
}

export function PerformanceMetrics() {
  const [data, setData] = useState<MerchantSummary[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.merchants(1).then(setData).catch((e) => setError(e.message))
  }, [])

  const top = data?.[0]
  const kpis: Kpi[] = [
    { title: 'حجم تراکنش', value: top ? formatRials(top.total_amount) : '—', hint: 'ریال', icon: Wallet, iconClass: 'bg-blue-100 text-blue-700' },
    { title: 'تعداد تراکنش', value: top ? new Intl.NumberFormat('fa-IR').format(top.txn_count) : '—', hint: 'تلاش پرداخت', icon: TrendingUp, iconClass: 'bg-indigo-100 text-indigo-700' },
    { title: 'نرخ موفقیت', value: top ? formatPercent(top.success_rate) : '—', hint: 'Verified / کل', icon: CheckCircle2, iconClass: 'bg-emerald-100 text-emerald-700' },
    { title: 'سهم کارمزد', value: top ? formatPercent(top.fee_ratio) : '—', hint: 'کارمزد تعدیل‌شده به حجم', icon: Percent, iconClass: 'bg-amber-100 text-amber-700' },
    { title: 'روزهای فعال', value: top ? new Intl.NumberFormat('fa-IR').format(top.active_days) : '—', hint: 'روز', icon: CalendarDays, iconClass: 'bg-rose-100 text-rose-700' },
  ]

  return (
    <div>
      <h2 className="mb-3 text-lg font-bold">نمای کلی پذیرنده</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {kpis.map((kpi) => (
          <Card key={kpi.title} className="overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <span className={`rounded-md p-1.5 ${kpi.iconClass}`}>
                  <kpi.icon className="h-4 w-4" />
                </span>
                {kpi.title}
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
      {error && <p className="mt-2 text-sm text-destructive">خطا در دریافت داده‌ها: {error}</p>}
    </div>
  )
}

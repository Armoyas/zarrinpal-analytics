'use client'

import { useEffect, useState } from 'react'
import { GitCompareArrows, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { api, type PeerComparison } from '@/lib/api'
import { formatRials, formatNumber } from '@/lib/utils'

function CompareBar({
  label,
  value,
  max,
  color,
  display,
}: {
  label: string
  value: number
  max: number
  color: string
  display: string
}) {
  const width = max > 0 ? Math.max(3, (value / max) * 100) : 0
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="num font-semibold" dir="ltr">
          {display}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${width}%` }} />
      </div>
    </div>
  )
}

export function PeerComparison() {
  const [data, setData] = useState<PeerComparison | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api
      .merchants(1)
      .then((merchants) => {
        if (merchants.length > 0) return api.peerComparison(merchants[0].merchant_key)
        throw new Error('No merchants found')
      })
      .then(setData)
      .catch((e) => setError(e.message))
  }, [])

  const maxAmount = Math.max(data?.my_amount ?? 0, data?.peer_avg_amount ?? 0, 1)
  const diff =
    data && data.peer_avg_amount > 0 ? ((data.my_amount - data.peer_avg_amount) / data.peer_avg_amount) * 100 : null
  const DiffIcon = diff === null || Math.abs(diff) < 1 ? Minus : diff > 0 ? TrendingUp : TrendingDown

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitCompareArrows className="h-5 w-5 text-indigo-500" />
          مقایسه با هم‌صنفی‌ها
        </CardTitle>
        <CardDescription>موقعیت پذیرنده نسبت به میانه صنف «{data?.category ?? '—'}»</CardDescription>
      </CardHeader>
      <CardContent>
        {!data && !error ? (
          <Skeleton className="h-48 w-full" />
        ) : error ? (
          <div className="flex h-48 items-center justify-center text-sm text-destructive">خطا: {error}</div>
        ) : (
          <div className="space-y-5">
            {data?.percentile_rank != null && (
              <div className="rounded-xl border bg-gradient-to-b from-indigo-500/[0.07] to-card p-4">
                <p className="text-xs text-muted-foreground">رتبه درون‌صنفی (درصد)</p>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="num text-3xl font-extrabold text-indigo-600 dark:text-indigo-400" dir="ltr">
                    {formatNumber(data.percentile_rank)}
                  </span>
                  <span className="text-sm font-medium text-muted-foreground">٪</span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-gradient-to-l from-indigo-500 to-indigo-400 transition-all duration-700"
                    style={{ width: `${data.percentile_rank}%` }}
                  />
                </div>
              </div>
            )}

            <div className="space-y-3">
              <CompareBar
                label="حجم پذیرنده"
                value={data?.my_amount ?? 0}
                max={maxAmount}
                color="bg-amber-500"
                display={formatRials(data?.my_amount)}
              />
              <CompareBar
                label="میانه هم‌صنفی‌ها"
                value={data?.peer_avg_amount ?? 0}
                max={maxAmount}
                color="bg-muted-foreground/50"
                display={formatRials(data?.peer_avg_amount)}
              />
            </div>

            {diff !== null && (
              <div className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
                <DiffIcon
                  className={`h-4 w-4 ${
                    Math.abs(diff) < 1 ? 'text-muted-foreground' : diff > 0 ? 'text-emerald-500' : 'text-red-500'
                  }`}
                />
                <span className="text-muted-foreground">اختلاف با میانه:</span>
                <span
                  className={`num font-bold ${
                    Math.abs(diff) < 1 ? 'text-foreground' : diff > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                  }`}
                  dir="ltr"
                >
                  {diff > 0 ? '+' : ''}
                  {new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 0 }).format(diff)}٪
                </span>
              </div>
            )}

            {data?.my_success_rate != null && (
              <CompareBar
                label="نرخ موفقیت شما"
                value={data.my_success_rate}
                max={100}
                color="bg-emerald-500"
                display={`${new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 1 }).format(data.my_success_rate)}٪`}
              />
            )}
            {data?.peer_avg_rate != null && (
              <CompareBar
                label="نرخ موفقیت هم‌صنفی‌ها"
                value={data.peer_avg_rate}
                max={100}
                color="bg-muted-foreground/50"
                display={`${new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 1 }).format(data.peer_avg_rate)}٪`}
              />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

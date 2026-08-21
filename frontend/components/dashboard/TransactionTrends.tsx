'use client'

import { useEffect, useState } from 'react'
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { api, type DailyTrendPoint } from '@/lib/api'
import { formatCompactRials } from '@/lib/utils'
import { Info } from 'lucide-react'

interface ChartDatum {
  label: string
  volume: number
  success: number
}

function faShortDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) return iso
  return new Intl.DateTimeFormat('fa-IR', { month: 'short', day: 'numeric' }).format(
    new Date(y, m - 1, d)
  )
}

interface TooltipPayload {
  value?: number | string
  name?: string
  dataKey?: string | number
  color?: string
}

function TrendTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const volume = payload.find((p: TooltipPayload) => p.dataKey === 'volume')?.value
  const success = payload.find((p: TooltipPayload) => p.dataKey === 'success')?.value
  return (
    <div className="rounded-lg border bg-card px-3 py-2 text-xs shadow-md">
      <p className="mb-1.5 font-semibold text-foreground">{faShortDate(String(label))}</p>
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">حجم</span>
          <span className="num font-semibold text-amber-600 dark:text-amber-400">
            {formatCompactRials(Number(volume) * 1_000_000)} ریال
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">موفقیت</span>
          <span className="num font-semibold text-emerald-600 dark:text-emerald-400">
            {new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 1 }).format(Number(success))}٪
          </span>
        </div>
      </div>
    </div>
  )
}

export function TransactionTrends() {
  const [data, setData] = useState<ChartDatum[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api
      .dailyTrends(undefined, 90)
      .then((points: DailyTrendPoint[]) =>
        points.map((p) => ({
          label: p.day,
          volume: Math.round(p.amount / 1_000_000),
          success: Math.round(p.success_rate * 10) / 10,
        }))
      )
      .then(setData)
      .catch((e) => setError(e.message))
  }, [])

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle>روند تراکنش‌ها</CardTitle>
          <div className="flex items-center gap-1.5">
            <Badge variant="outline" className="gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              حجم (میلیون ریال)
            </Badge>
            <Badge variant="outline" className="gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              نرخ موفقیت
            </Badge>
          </div>
        </div>
        <CardDescription className="flex items-center gap-1.5">
          <Info className="h-3.5 w-3.5" />
          موفقیت = session_status در (Verified، Paid، Reversed)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!data && !error ? (
          <Skeleton className="h-[320px] w-full" />
        ) : error ? (
          <div className="flex h-[320px] items-center justify-center text-sm text-destructive">
            خطا در دریافت داده‌ها: {error}
          </div>
        ) : (
          <div className="h-[320px] w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data ?? []} margin={{ top: 8, right: 8, left: 8, bottom: 4 }}>
                <defs>
                  <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  tickLine={false}
                  axisLine={false}
                  minTickGap={28}
                  tickFormatter={(v: string) => faShortDate(v)}
                />
                <YAxis
                  yAxisId="volume"
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  tickLine={false}
                  axisLine={false}
                  width={44}
                  tickFormatter={(v: number) => formatCompactRials(v)}
                />
                <YAxis
                  yAxisId="success"
                  orientation="right"
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  tickLine={false}
                  axisLine={false}
                  width={36}
                  domain={[0, 100]}
                  tickFormatter={(v: number) => `${v}٪`}
                />
                <Tooltip content={<TrendTooltip />} cursor={{ stroke: 'hsl(var(--border))' }} />
                <Area
                  yAxisId="volume"
                  type="monotone"
                  dataKey="volume"
                  stroke="hsl(var(--chart-1))"
                  strokeWidth={2}
                  fill="url(#volumeGradient)"
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0 }}
                />
                <Line
                  yAxisId="success"
                  type="monotone"
                  dataKey="success"
                  stroke="hsl(var(--chart-5))"
                  strokeWidth={1.75}
                  dot={false}
                  activeDot={{ r: 3, strokeWidth: 0 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { api, type DailyTrendPoint } from '@/lib/api'
import { formatRials } from '@/lib/utils'
import { Info } from 'lucide-react'

interface ChartDatum {
  label: string
  volume: number
  count: number
  success: number
}

const PERSIAN_DAYS = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج']

export function TransactionTrends() {
  const [data, setData] = useState<ChartDatum[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.dailyTrends(undefined, 90)
      .then((points: DailyTrendPoint[]) =>
        points.map((p) => ({
          label: p.day.slice(5),
          volume: Math.round(p.amount / 1_000_000),
          count: p.count,
          success: p.success_rate,
        }))
      )
      .then(setData)
      .catch((e) => setError(e.message))
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>📈</span>
          روند تراکنش‌ها (۹۰ روز اخیر)
        </CardTitle>
        <CardDescription className="flex items-center gap-1">
          حجم تراکنت بر حسب میلیون ریال و نرخ موفقیت روزانه
          <Info className="h-3 w-3" />
          موفقیت = session_status در (Verified، Paid، Reversed)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!data && !error ? (
          <Skeleton className="h-72 w-full" />
        ) : error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : (
          <div className="h-72 w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data ?? []} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} tickFormatter={(v: string) => v} />
                <YAxis tick={{ fontSize: 11 }} width={50} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="volume" name="حجم (میلیون ریال)" stroke="#1a4d8f" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="count" name="تعداد تلاش" stroke="#0d9488" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="success" name="نرخ موفقیت (٪)" stroke="#f59e0b" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

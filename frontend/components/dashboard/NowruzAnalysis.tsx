'use client'

import { useEffect, useState } from 'react'
import { CalendarDays } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { api, type NowruzImpact } from '@/lib/api'
import { formatRials } from '@/lib/utils'

export function NowruzAnalysis() {
  const [data, setData] = useState<NowruzImpact | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.nowruz().then(setData).catch((e) => setError(e.message))
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-emerald-600" />
          تحلیل اثر نوروز بر کسب‌وکار
        </CardTitle>
        <CardDescription>مقایسه حجم تراکنش قبل، حین و بعد از تعطیلات نوروز</CardDescription>
      </CardHeader>
      <CardContent>
        {!data && !error ? (
          <Skeleton className="h-32 w-full" />
        ) : error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-muted/50 p-4 text-center">
              <p className="text-xs text-muted-foreground">قبل از نوروز</p>
              <p className="mt-1 font-bold" dir="ltr">{formatRials(data?.before)}</p>
            </div>
            <div className="rounded-lg bg-primary/10 p-4 text-center">
              <p className="text-xs text-muted-foreground">حین نوروز</p>
              <p className="mt-1 font-bold text-primary" dir="ltr">{formatRials(data?.during)}</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-4 text-center">
              <p className="text-xs text-muted-foreground">بعد از نوروز</p>
              <p className="mt-1 font-bold" dir="ltr">{formatRials(data?.after)}</p>
            </div>
          </div>
        )}
        {data?.lift_pct !== null && data?.lift_pct !== undefined && (
          <p className="mt-3 text-sm">
            تغییر حجم در نوروز:{' '}
            <span className="font-bold text-primary" dir="ltr">
              {new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 1 }).format(data.lift_pct)}٪
            </span>{' '}
            <span className="text-xs text-muted-foreground">(تعداد نمونه: {new Intl.NumberFormat('fa-IR').format(data.sample_size)})</span>
          </p>
        )}
      </CardContent>
    </Card>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { GitCompareArrows } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { api, type PeerComparison } from '@/lib/api'
import { formatRials } from '@/lib/utils'

export function PeerComparison() {
  const [data, setData] = useState<PeerComparison | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.peerComparison('sample').then(setData).catch((e) => setError(e.message))
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitCompareArrows className="h-5 w-5 text-indigo-600" />
          مقایسه با کسب‌وکارهای هم‌صنف
        </CardTitle>
        <CardDescription>موقعیت پذیرنده نسبت به میانه و صدک ۹۰ هم‌صنفی‌ها</CardDescription>
      </CardHeader>
      <CardContent>
        {!data && !error ? (
          <Skeleton className="h-32 w-full" />
        ) : error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <span className="text-sm text-muted-foreground">حجم پذیرنده</span>
              <span className="font-bold" dir="ltr">{formatRials(data?.merchant_amount)}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <span className="text-sm text-muted-foreground">میانه هم‌صنفی‌ها</span>
              <span className="font-bold" dir="ltr">{formatRials(data?.peer_median)}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <span className="text-sm text-muted-foreground">صدک ۹۰ هم‌صنفی‌ها</span>
              <span className="font-bold" dir="ltr">{formatRials(data?.peer_p90)}</span>
            </div>
            {data?.percentile !== undefined && data?.percentile !== null && (
              <p className="rounded-lg bg-indigo-50 p-3 text-sm text-indigo-900">
                پذیرنده در صدک{' '}
                <span className="font-bold">{new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 0 }).format(data.percentile)}</span>{' '}
                صنف «{data.category}» قرار دارد.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

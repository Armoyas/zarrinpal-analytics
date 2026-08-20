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
    // Use a sample merchant from the data for demo
    api.merchants(1).then((merchants) => {
      if (merchants.length > 0) {
        return api.peerComparison(merchants[0].merchant_key)
      }
      throw new Error('No merchants found')
    }).then(setData).catch((e) => setError(e.message))
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitCompareArrows className="h-5 w-5 text-indigo-600" />
          مقایسه با کسب‌وکارهای هم‌صنف
        </CardTitle>
        <CardDescription>موقعیت پذیرنده نسبت به میانه و درصد رتبه درون هم‌صنفی‌ها</CardDescription>
      </CardHeader>
      <CardContent>
        {!data && !error ? (
          <Skeleton className="h-48 w-full" />
        ) : error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <span className="text-sm text-muted-foreground">حجم پذیرنده (Rial)</span>
              <span className="font-bold" dir="ltr">{formatRials(data?.my_amount)}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <span className="text-sm text-muted-foreground">میانه هم‌صنفی‌ها</span>
              <span className="font-bold" dir="ltr">{formatRials(data?.peer_avg_amount)}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <span className="text-sm text-muted-foreground">نرخ موفقیت هم‌صنفی‌ها</span>
              <span className="font-bold" dir="ltr">
                {data?.peer_avg_rate !== null && data?.peer_avg_rate !== undefined
                  ? `${new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 1 }).format(data.peer_avg_rate)}٪`
                  : '—'}
              </span>
            </div>
            {data?.percentile_rank !== undefined && data?.percentile_rank !== null && (
              <p className="rounded-lg bg-indigo-50 p-3 text-sm text-indigo-900">
                پذیرنده در درصد رتبه{' '}
                <span className="font-bold" dir="ltr">
                  {new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 0 }).format(data.percentile_rank)}٪
                </span>{' '}
                صنف «{data.category}» قرار دارد.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

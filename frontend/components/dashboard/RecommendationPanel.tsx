'use client'

import { useEffect, useState } from 'react'
import { Lightbulb, TrendingUp, AlertTriangle, Info } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { api, type Recommendation } from '@/lib/api'

const priorityMeta: Record<string, { label: string; variant: 'success' | 'warning' | 'destructive'; icon: React.ElementType }> = {
  high: { label: 'اولویت بالا', variant: 'destructive', icon: AlertTriangle },
  medium: { label: 'اولویت متوسط', variant: 'warning', icon: TrendingUp },
  low: { label: 'اولویت پایین', variant: 'success', icon: Info },
}

export function RecommendationPanel() {
  const [items, setItems] = useState<Recommendation[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.recommendations('sample').then(setItems).catch((e) => setError(e.message))
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-amber-500" />
          پیشنهادهای هوشمند برای پذیرنده
        </CardTitle>
        <CardDescription>بینش‌های قابل اقدام — هر پیشنهاد به یک عدد و اقدام مشخص منتهی می‌شود</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {!items && !error ? (
          <Skeleton className="h-40 w-full" />
        ) : error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : (
          items?.map((r) => {
            const meta = priorityMeta[r.priority] ?? priorityMeta.medium
            return (
              <div key={r.id} className="rounded-lg border p-4">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-semibold">{r.title}</h4>
                  <Badge variant={meta.variant}>
                    <meta.icon className="ml-1 h-3 w-3" />
                    {meta.label}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{r.description}</p>
                <p className="mt-2 text-xs text-muted-foreground" dir="ltr">
                  محاسبه: {r.calculation}
                </p>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}

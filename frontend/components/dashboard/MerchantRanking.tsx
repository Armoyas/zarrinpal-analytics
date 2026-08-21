'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Info, Trophy } from 'lucide-react'
import { api, type MerchantSummary } from '@/lib/api'
import { cn, formatRials, formatNumber, formatPercent } from '@/lib/utils'

function RankBadge({ rank }: { rank: number }) {
  const styles: Record<number, string> = {
    1: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/30',
    2: 'bg-slate-400/15 text-slate-500 dark:text-slate-300 ring-1 ring-slate-400/30',
    3: 'bg-orange-700/15 text-orange-700 dark:text-orange-400 ring-1 ring-orange-700/30',
  }
  return (
    <span
      className={cn(
        'num inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold',
        styles[rank] ?? 'text-muted-foreground'
      )}
    >
      {formatNumber(rank)}
    </span>
  )
}

function SuccessCell({ rate }: { rate: number }) {
  const variant = rate >= 90 ? 'success' : rate >= 70 ? 'warning' : 'destructive'
  const barColor = rate >= 90 ? 'bg-emerald-500' : rate >= 70 ? 'bg-amber-500' : 'bg-red-500'
  return (
    <div className="flex min-w-[120px] flex-col gap-1.5">
      <Badge variant={variant} className="w-fit">
        <span className="num">{formatPercent(rate)}</span>
      </Badge>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className={cn('h-full rounded-full transition-all', barColor)} style={{ width: `${rate}%` }} />
      </div>
    </div>
  )
}

export function MerchantRanking() {
  const [rows, setRows] = useState<MerchantSummary[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api
      .merchants(20)
      .then(setRows)
      .catch((e) => setError(e.message))
  }, [])

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            رتبه‌بندی پذیرنده‌ها
          </CardTitle>
          <Badge variant="gold">
            <span className="num">{rows ? formatNumber(rows.length) : '—'}</span> پذیرنده
          </Badge>
        </div>
        <CardDescription className="flex items-center gap-1.5">
          <Info className="h-3.5 w-3.5" />
          سهم کارمزد تنها برای مقایسه نسبی معتبر است (adjusted_fee تنظیم‌شده)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!rows && !error ? (
          <Skeleton className="h-64 w-full" />
        ) : error ? (
          <div className="flex h-64 items-center justify-center text-sm text-destructive">خطا: {error}</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-12">#</TableHead>
                <TableHead>پذیرنده</TableHead>
                <TableHead className="hidden sm:table-cell">صنف</TableHead>
                <TableHead>حجم (ریال)</TableHead>
                <TableHead className="hidden md:table-cell">تعداد تلاش</TableHead>
                <TableHead>نرخ موفقیت</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows?.map((r, i) => (
                <TableRow key={r.merchant_key}>
                  <TableCell>
                    <RankBadge rank={i + 1} />
                  </TableCell>
                  <TableCell>
                    <span className="num font-mono text-xs font-semibold text-foreground" dir="ltr">
                      {r.merchant_key}
                    </span>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      {r.category_title ?? '—'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="num text-sm font-medium" dir="ltr">
                      {formatRials(r.total_amount)}
                    </span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <span className="num text-sm text-muted-foreground">{formatNumber(r.total_attempts)}</span>
                  </TableCell>
                  <TableCell>
                    <SuccessCell rate={r.success_rate_pct} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}

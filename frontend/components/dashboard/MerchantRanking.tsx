'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Info } from 'lucide-react'
import { api, type MerchantSummary } from '@/lib/api'
import { formatRials, formatPercent } from '@/lib/utils'

export function MerchantRanking() {
  const [rows, setRows] = useState<MerchantSummary[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.merchants(20)
      .then(setRows)
      .catch((e) => setError(e.message))
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>رتبه‌بندی پذیرنده‌ها</CardTitle>
        <CardDescription>
          مقایسه نسبی پذیرنده‌ها بر اساس حجم و نرخ موفقیت — سهم کارمزد تنها برای مقایسه نسبی معتبر است
          <span className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
            <Info className="h-3 w-3" />
            adjusted_fee یک مقدار کارمزد تنظیم‌شده است، فقط روابط نسبی معتبر است
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!rows && !error ? (
          <Skeleton className="h-64 w-full" />
        ) : error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>پذیرنده</TableHead>
                  <TableHead>صنف</TableHead>
                  <TableHead>حجم (ریال)</TableHead>
                  <TableHead>تعداد</TableHead>
                  <TableHead>نرخ موفقیت</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows?.map((r, i) => (
                  <TableRow key={r.merchant_key}>
                    <TableCell className="font-medium">{new Intl.NumberFormat('fa-IR').format(i + 1)}</TableCell>
                    <TableCell dir="ltr" className="font-mono text-xs">{r.merchant_key}</TableCell>
                    <TableCell>{r.category_title ?? '—'}</TableCell>
                    <TableCell dir="ltr">{formatRials(r.total_amount)}</TableCell>
                    <TableCell>{new Intl.NumberFormat('fa-IR').format(r.total_attempts)}</TableCell>
                    <TableCell>
                      <Badge variant={r.success_rate_pct >= 90 ? 'success' : r.success_rate_pct >= 70 ? 'warning' : 'destructive'}>
                        {formatPercent(r.success_rate_pct)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

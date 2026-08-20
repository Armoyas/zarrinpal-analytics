'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { api, type MerchantSummary } from '@/lib/api'
import { formatRials, formatPercent } from '@/lib/utils'

export function MerchantRanking() {
  const [rows, setRows] = useState<MerchantSummary[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.merchants(10).then(setRows).catch((e) => setError(e.message))
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>رتبه‌بندی پذیرنده‌ها</CardTitle>
        <CardDescription>مقایسه نسبی پذیرنده‌ها بر اساس حجم و نرخ موفقیت — کارمزد تعدیل‌شده فقط برای مقایسه نسبی معتبر است</CardDescription>
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
                  <TableHead>صنف</TableHead>
                  <TableHead>حجم (ریال)</TableHead>
                  <TableHead>تعداد</TableHead>
                  <TableHead>نرخ موفقیت</TableHead>
                  <TableHead>سهم کارمزد</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows?.map((r, i) => (
                  <TableRow key={r.merchant_key}>
                    <TableCell className="font-medium">{new Intl.NumberFormat('fa-IR').format(i + 1)}</TableCell>
                    <TableCell>{r.category_title ?? '—'}</TableCell>
                    <TableCell dir="ltr">{formatRials(r.total_amount)}</TableCell>
                    <TableCell>{new Intl.NumberFormat('fa-IR').format(r.txn_count)}</TableCell>
                    <TableCell>
                      <Badge variant={r.success_rate >= 90 ? 'success' : r.success_rate >= 70 ? 'warning' : 'destructive'}>
                        {formatPercent(r.success_rate)}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatPercent(r.fee_ratio)}</TableCell>
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

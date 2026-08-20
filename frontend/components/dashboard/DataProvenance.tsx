'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Database } from 'lucide-react'

export function DataProvenance() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5 text-teal-600" />
          ردیابی محاسبات (منبع هر عدد)
        </CardTitle>
        <CardDescription>هر عدد در داشبورد از کجا آمده و چگونه محاسبه شده است</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          متادیتای محاسبه برای هر متریک از طریق endpoint <code>/api/v1/overview</code>
          قابل دسترسی است (فیلد how_calculated). هر عدد در کارت‌های KPI با آیکن
          علامت سؤال قابل ردیابی است.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          برای مثال:
        </p>
        <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
          <li><code>total_attempts</code>: COUNT(*) — تعداد ردیف‌های پرداخت (تلاش)</li>
          <li><code>success_rate</code>: ((paid + verified) / total) × 100</li>
          <li><code>total_amount</code>: SUM(amount) — مجموع مبلغ به ریال</li>
        </ul>
      </CardContent>
    </Card>
  )
}

'use client'

import { Database, ScanSearch } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const formulas = [
  { label: 'تعداد تلاش‌ها', code: 'COUNT(*)' },
  { label: 'نرخ موفقیت', code: '((paid + verified) / total) × 100' },
  { label: 'مجموع مبلغ', code: 'SUM(amount)' },
  { label: 'سهم کارمزد', code: 'SUM(adjusted_fee) / SUM(amount) × 100' },
]

export function DataProvenance() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5 text-teal-500" />
          ردیابی محاسبات — منبع هر عدد
        </CardTitle>
        <CardDescription className="flex items-center gap-1.5">
          <ScanSearch className="h-3.5 w-3.5" />
          هیچ عددی جعبه سیاه نیست؛ فرمول هر متریک از طریق فیلد{' '}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs" dir="ltr">
            how_calculated
          </code>{' '}
          در دسترس است.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {formulas.map((f) => (
            <div key={f.label} className="rounded-xl border bg-muted/30 p-3">
              <p className="text-xs font-medium text-muted-foreground">{f.label}</p>
              <code
                className="mt-1.5 block truncate rounded-md bg-card px-2 py-1.5 font-mono text-[11px] text-foreground"
                dir="ltr"
              >
                {f.code}
              </code>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

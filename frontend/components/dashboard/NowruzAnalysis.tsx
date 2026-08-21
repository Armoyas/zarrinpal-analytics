'use client'

import { CalendarDays } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function NowruzAnalysis() {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-rose-500" />
            تحلیل اثر نوروز
          </CardTitle>
          <Badge variant="outline">فاز ۱</Badge>
        </div>
        <CardDescription>بررسی الگوی فصلی تراکنش‌ها در ایام نوروز</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-xl border border-dashed p-4 text-center">
          <p className="text-sm text-muted-foreground">
            پس از تأیید ستون <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs" dir="ltr">created_at</code>{' '}
            و ساختار زمانی داده‌ها، تحلیل اثر نوروز در فاز بعدی فعال خواهد شد.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Construction } from 'lucide-react'

export function NowruzAnalysis() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Construction className="h-5 w-5 text-gray-400" />
          تحلیل اثر نوروز بر کسب‌وکار
        </CardTitle>
        <CardDescription>قابلیت در فاز ۱ (بعد از یافتن ستون تاریخ دقیق تأیید شد)</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          این بخش در Phase 0 پیاده‌سازی نشده است. پس از تأیید ستون created_at و
          ساختار زمانی، می‌تواند در فاز بعدی اضافه شود.
        </p>
      </CardContent>
    </Card>
  )
}

'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Lightbulb } from 'lucide-react'

export function RecommendationPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-gray-400" />
          پیشنهادهای هوشمند برای پذیرنده
        </CardTitle>
        <CardDescription>بینش‌های قابل اقدام — هر پیشنهاد به یک عدد و اقدام مشخص منتهی می‌شود</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          این بخش در Phase 0 پیاده‌سازی نشده است. پیشنهادات هوشمند نیاز به اطلاعات
          بیشتری دارند که در Phase 0 در دسترس نیست (مانند شناسه مشتری یا محصول).
          پس از تکمیل فاز ۰ و یافتن ستون‌های مورد نیاز، این بخش فعال خواهد شد.
        </p>
      </CardContent>
    </Card>
  )
}

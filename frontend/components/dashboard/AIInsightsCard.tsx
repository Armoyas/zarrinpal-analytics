import { useQuery } from "@tanstack/react-query"
import { api, SpendingPattern } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Brain, Target, Zap, Users, BarChart3, AlertCircle, Gift } from "lucide-react"
import { toPersianNumber } from "@/lib/utils"

const iconMap: Record<string, React.ElementType> = {
  "high_volume": BarChart3,
  "low_success": AlertCircle,
  "card_gift": Gift,
  "default": Brain,
}

export function AIInsightsCard() {
  const { data: patterns, isLoading } = useQuery({
    queryKey: ["spending-patterns"],
    queryFn: api.getSpendingPatterns,
  })

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>بینش هوش مصنوعی</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (!patterns || patterns.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>بینش هوش مصنوعی</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-4">در حال تحلیل...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-500" />
          بینش هوش مصنوعی
        </CardTitle>
        <CardDescription>تحلیل‌های خودکار الگوهای پرداختی</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {patterns.map((pattern, i) => {
            const Icon = iconMap[pattern.pattern] || iconMap["default"]
            return (
              <div key={i} className="border rounded-lg p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">{pattern.description}</span>
                  </div>
                  <Badge variant="secondary">
                    {toPersianNumber(Math.round(pattern.confidence * 100))}%
                  </Badge>
                </div>
                <Badge variant="outline">
                  {toPersianNumber(pattern.affected_count)} فروشگاه تحت تأثیر
                </Badge>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
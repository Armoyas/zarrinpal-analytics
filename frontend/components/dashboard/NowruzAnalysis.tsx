import { useQuery } from "@tanstack/react-query"
import { api, NowruzData } from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Gift, TrendingUp, Calendar, ShoppingBag } from "lucide-react"
import { toPersianNumber, formatCurrency } from "@/lib/utils"

export function NowruzAnalysis() {
  const { data: nowruzData, isLoading } = useQuery({
    queryKey: ["nowruz-analytics"],
    queryFn: api.getNowruzAnalytics,
  })

  if (isLoading) {
    return <Skeleton className="h-48 w-full" />
  }

  if (!nowruzData) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <Calendar className="h-8 w-8 mx-auto mb-2" />
        <p>داده‌های نوروز ۱۴۰۵ در دسترس نیست</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">
                {toPersianNumber(Math.round(nowruzData.growth_rate * 100))}%
              </p>
              <p className="text-xs text-muted-foreground mt-1">رشد فروش</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">
                {toPersianNumber(nowruzData.gift_card_analysis.gift_card_share * 100)}%
              </p>
              <p className="text-xs text-muted-foreground mt-1">اشتراک هدیه‌نامه</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">
                {toPersianNumber(nowruzData.daily_patterns.length)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">روز پیگیری شده</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Gift className="h-6 w-6 mx-auto text-primary mb-1" />
              <p className="text-xs text-muted-foreground mt-1">تحلیل هدیه‌نامه</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gift Card Analysis */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="font-medium mb-4 flex items-center gap-2">
            <Gift className="h-4 w-4 text-primary" />
            تحلیل کارت هدیه
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">درآمد کل:</span>
              <span className="font-medium">{formatCurrency(nowruzData.gift_card_analysis.total_gift_card_revenue)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">اشتراک فروشگاه‌ها:</span>
              <Badge variant="secondary">{toPersianNumber(nowruzData.gift_card_analysis.top_gift_card_merchants.length)} فروشگاه</Badge>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">فروشگاه‌های برتر:</p>
              <div className="flex flex-wrap gap-1">
                {nowruzData.gift_card_analysis.top_gift_card_merchants.slice(0, 3).map((merchant, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {merchant.slice(0, 10)}...
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Patterns */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="font-medium mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            الگوهای روزانه
          </h3>
          <div className="space-y-2 text-xs">
            {nowruzData.daily_patterns.map((pattern, i) => (
              <div key={i} className="grid grid-cols-4 gap-2 items-center">
                <span className="text-muted-foreground">{pattern.day}</span>
                <span className="text-right">{toPersianNumber(pattern.transactions)} تراکنش</span>
                <span className="text-right">{formatCurrency(pattern.revenue)}</span>
                <span className="text-right text-primary">{toPersianNumber(Math.round(pattern.gift_card_share * 100))}% هدیه</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendation */}
      {nowruzData.recommendation && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <ShoppingBag className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-medium mb-1">پیشنهاد هوشمند</h4>
                <p className="text-sm text-muted-foreground">{nowruzData.recommendation}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
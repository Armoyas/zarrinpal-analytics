"use client"

import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Gift, TrendingUp, Calendar, ShoppingBag, BarChart3 } from "lucide-react"
import { toPersianNumber, formatCurrencyIRToman, formatPercentValue } from "@/lib/utils"

export function NowruzAnalysis() {
  const { data: nowruzData, isLoading } = useQuery({
    queryKey: ["nowruz-analytics"],
    queryFn: api.getNowruzAnalytics,
    staleTime: 1000 * 60 * 5,
  })

  if (isLoading) {
    return <Skeleton className="h-96 w-full" />
  }

  if (!nowruzData) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <Calendar className="h-8 w-8 mx-auto mb-2" />
        <p>داده‌های نوروز ۱۴۰۵ در دسترس نیست</p>
      </div>
    )
  }

  const growthRate = nowruzData.growth_rate || 0
  const isGrowthPositive = growthRate >= 0

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p
                className={`text-2xl font-bold ${
                  isGrowthPositive ? "text-green-400" : "text-red-400"
                }`}
              >
                {isGrowthPositive ? "+" : ""}
                {toPersianNumber(growthRate.toFixed(1))}%
              </p>
              <p className="text-xs text-muted-foreground mt-1">رشد فروش</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">
                {formatPercentValue(nowruzData.gift_card_analysis?.gift_card_share || 0)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">اشتراک کارت هدیه</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">
                {toPersianNumber(nowruzData.daily_patterns?.length || 0)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">روز پیگیری شده</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              <p className="text-2xl font-bold text-primary">
                {toPersianNumber(nowruzData.period_transactions || 0)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">تراکنش کل</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Prediction Summary */}
      {nowruzData.prediction && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-medium mb-4 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              پیش‌بینی نوروز ۱۴۰۵
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <p className="text-2xl font-bold text-primary">
                  {toPersianNumber(nowruzData.prediction.predicted_transactions?.toLocaleString() || "0")}
                </p>
                <p className="text-xs text-muted-foreground">تراکنش پیش‌بینی شده</p>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <p className="text-2xl font-bold text-primary">
                  {formatPercentValue(nowruzData.prediction.confidence || 0)}
                </p>
                <p className="text-xs text-muted-foreground">اعتبار پیش‌بینی</p>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <p className="text-2xl font-bold text-primary">
                  +{formatPercentValue(nowruzData.prediction.expected_revenue_increase_pct || 0)}
                </p>
                <p className="text-xs text-muted-foreground">افزایش درآمد پیش‌بینی شده</p>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <p className="text-2xl font-bold text-primary">
                  {toPersianNumber(nowruzData.prediction.days_until_nowruz || 0)}
                </p>
                <p className="text-xs text-muted-foreground">روز تا نوروز</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
              {formatCurrencyIRToman(nowruzData.gift_card_analysis?.total_gift_card_revenue || 0)}
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">اشتراک فروشگاه‌ها:</span>
              <Badge variant="secondary">
                {toPersianNumber(nowruzData.gift_card_analysis?.top_gift_card_merchants?.length || 0)} فروشگاه
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">فروشگاه‌های برتر:</p>
              <div className="flex flex-wrap gap-1">
                {(nowruzData.gift_card_analysis?.top_gift_card_merchants || []).slice(0, 3).map((merchant: string, i: number) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {merchant}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Patterns - Nowruz holiday window */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="font-medium mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            الگوهای پیش از نوروز (۶۲ روز گذشته)
          </h3>
          <div className="space-y-2 text-xs">
            {(nowruzData.daily_patterns || []).slice(0, 20).map((pattern, i) => (
              <div key={i} className="grid grid-cols-5 gap-2 items-center">
                <span className="text-muted-foreground">{pattern.day}</span>
                <span className="text-right col-span-2">
                  {formatCurrencyIRToman(pattern.revenue || 0)}
                </span>
                <span className="text-right text-primary">
                  {toPersianNumber(pattern.transactions)} تراکنش
                </span>
              </div>
            ))}
            {(nowruzData.daily_patterns || []).length > 20 && (
              <p className="text-muted-foreground text-center pt-2">
                {toPersianNumber((nowruzData.daily_patterns || []).length - 20)} روز دیگر...
              </p>
            )}
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

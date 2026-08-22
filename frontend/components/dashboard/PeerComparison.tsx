"use client"

import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { toPersianNumber, formatPercentValue, formatCurrencyIRToman } from "@/lib/utils"
import { TrendingUp, Users, BarChart3, PieChart } from "lucide-react"

export function PeerComparison({ merchantKey }: { merchantKey?: string | null }) {
  const { data: merchantDetail, isLoading: merchantLoading } = useQuery({
    queryKey: ["merchant-detail", merchantKey],
    queryFn: () => api.getMerchantDetail(merchantKey!),
    staleTime: 1000 * 60 * 5,
    enabled: !!merchantKey,
  })

  const { data: peerData, isLoading: peerLoading } = useQuery({
    queryKey: ["peer-comparison", merchantKey],
    queryFn: () => api.getPeerComparison(merchantKey!),
    staleTime: 1000 * 60 * 5,
    enabled: !!merchantKey,
  })

  const isLoading = merchantLoading || peerLoading

  if (!merchantKey) {
    return (
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle>مقایسه با همتاها</CardTitle>
          <CardDescription>یک فروشگاه را انتخاب کنید</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            برای مقایسه، روی یک فروشگاه در جدول کلیک کنید
          </p>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle>مقایسه با همتاها</CardTitle>
          <CardDescription>یک فروشگاه را انتخاب کنید</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            برای مقایسه، روی یک فروشگاه در جدول کلیک کنید
          </p>
        </CardContent>
      </Card>
    )
  }

  if (!merchantDetail && !peerData) {
    return (
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle>مقایسه با همتاها</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-4">
            داده‌ای یافت نشد
          </p>
        </CardContent>
      </Card>
    )
  }

  // Use real peer comparison data
  const percentile = peerData?.percentile_rank || 0
  const successRate = merchantDetail?.success_rate || 0
  const avgAmount = merchantDetail?.avg_amount || 0
  const peerAvgAmount = peerData?.peer_avg_amount || 0
  const peerSuccessRate = peerData?.peer_success_rate || 0
  const totalAttempts = merchantDetail?.total_attempts || 0

  const peerAvgTransactionRatio = peerAvgAmount > 0 ? (avgAmount / peerAvgAmount) * 100 - 100 : 0
  const rateDiff = successRate - peerSuccessRate

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader>
        <CardTitle>مقایسه با همتاها</CardTitle>
        <CardDescription>
          {merchantKey} — {merchantDetail?.category_title || peerData?.category || ''}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Percentile Rank */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Users className="h-3 w-3" />
              درصد برتری
            </span>
            <span className="font-bold text-2xl text-primary">
              {toPersianNumber(percentile)}٪
            </span>
          </div>
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${percentile}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {toPersianNumber(percentile)}٪ برتر از فروشگاه‌های هم‌دسته
          </p>
        </div>

        {/* Comparison Metrics Grid */}
        <div className="grid grid-cols-3 gap-4 pt-2">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <BarChart3 className="h-3 w-3 text-green-400" />
              <span className="font-bold text-2xl text-green-400">
                {formatPercentValue(successRate)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">نرخ موفقیت</p>
            <p className={`text-xs ${rateDiff >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {rateDiff >= 0 ? '+' : ''}{formatPercentValue(rateDiff)} نسبت به هم‌دسته
            </p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <PieChart className="h-3 w-3 text-amber-400" />
              <span className="text-2xl font-bold text-amber-400">
                {formatPercentValue(peerAvgTransactionRatio)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">میانگین تراکنش</p>
            <p className={`text-xs ${peerAvgTransactionRatio >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {peerAvgTransactionRatio >= 0 ? 'بالاتر' : 'پایین‌تر'} از هم‌دسته
            </p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp className="h-3 w-3 text-blue-400" />
              <span className="font-bold text-2xl text-blue-400">
                {toPersianNumber(totalAttempts.toLocaleString())}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">تلاش پرداختی</p>
            <p className="text-xs text-muted-foreground">
              رتبه {toPersianNumber(merchantDetail?.merchant_rank || 0)} از {toPersianNumber(merchantDetail?.total_merchants_in_category || 0)} در دسته
            </p>
          </div>
        </div>

        {/* Peer comparison details */}
        {peerData && (
          <div className="space-y-2 pt-2 border-t">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">میانگین مبلغ هم‌دستگان:</span>
              <span>{formatCurrencyIRToman(peerAvgAmount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">میانگین مبلغ کلی:</span>
              <span>{formatCurrencyIRToman(peerData?.overall_avg_amount || 0)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">نرخ موفقیت هم‌دستگان:</span>
              <span>{formatPercentValue(peerSuccessRate)}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

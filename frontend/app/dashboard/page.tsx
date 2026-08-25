"use client"

import { Suspense, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { PerformanceMetrics } from "@/components/dashboard/PerformanceMetrics"
import { TransactionTrends } from "@/components/dashboard/TransactionTrends"
import { MerchantRanking } from "@/components/dashboard/MerchantRanking"
import { PeerComparison } from "@/components/dashboard/PeerComparison"
import { RecommendationPanel } from "@/components/dashboard/RecommendationPanel"
import { AIInsightsCard } from "@/components/dashboard/AIInsightsCard"
import { AnomalyDetector } from "@/components/dashboard/AnomalyDetector"
import { SpendingPatternsChart } from "@/components/dashboard/SpendingPatternsChart"
import { RiskAlertCard } from "@/components/dashboard/RiskAlertCard"
import { NowruzAnalysis } from "@/components/dashboard/NowruzAnalysis"
import { AIChat } from "@/components/dashboard/AIChat"
import { DataProvenance } from "@/components/dashboard/DataProvenance"
import { MerchantSelector } from "@/components/MerchantSelector"
import { DateRangeFilter } from "@/components/DateRangeFilter"
import { DataLimitationWarning } from "@/components/DataLimitationWarning"
import { CalculationDetails } from "@/components/CalculationDetails"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  TrendingUp, BarChart3, AlertTriangle, Gift, Grid3X3, Table2, Brain, ShoppingCart,
  PieChart, ArrowRight, DollarSign, Users, TrendingDown, Filter, HelpCircle,
} from "lucide-react"
import { toPersianNumber, formatCurrencyIRToman, formatPercentValue } from "@/lib/utils"
import Link from "next/link"

export default function DashboardPage() {
  const [selectedMerchant, setSelectedMerchant] = useState<string | null>(null)
  const [startDate, setStartDate] = useState<string | null>(null)
  const [endDate, setEndDate] = useState<string | null>(null)

  const dateParams = {
    start_date: startDate || undefined,
    end_date: endDate || undefined,
    merchant_key: selectedMerchant || undefined,
  }

  const { data: overviewData, isLoading: overviewLoading, refetch: refetchOverview } = useQuery({
    queryKey: ["overview", dateParams],
    queryFn: () => api.getOverview(dateParams.start_date, dateParams.end_date, dateParams.merchant_key),
  })

  const { data: merchantData, isLoading: merchantLoading, refetch: refetchMerchants } = useQuery({
    queryKey: ["merchants"],
    queryFn: () => api.getMerchants(50),
  })

  const { data: timeSeriesData, isLoading: timeSeriesLoading } = useQuery({
    queryKey: ["time-series-full", dateParams],
    queryFn: () => api.getTimeSeries("attempts", "day", dateParams.start_date, dateParams.end_date, dateParams.merchant_key),
    staleTime: 1000 * 60 * 5,
  })

  const { data: amountSeriesData } = useQuery({
    queryKey: ["time-series-amount", dateParams],
    queryFn: () => api.getTimeSeries("amount", "day", dateParams.start_date, dateParams.end_date, dateParams.merchant_key),
    staleTime: 1000 * 60 * 5,
  })

  const { data: recommendations, isLoading: recommendationsLoading } = useQuery({
    queryKey: ["smart-recommendations", dateParams.merchant_key],
    queryFn: () => api.getSmartRecommendations(10),
  })

  const { data: categoryData, isLoading: categoryLoading } = useQuery({
    queryKey: ["category-distribution", dateParams],
    queryFn: () => api.getCategoryDistribution(),
    staleTime: 1000 * 60 * 5,
  })

  const { data: highValueData, isLoading: highValueLoading } = useQuery({
    queryKey: ["high-value-analysis"],
    queryFn: () => api.getHighValueAnalysis(10000000),
    staleTime: 1000 * 60 * 5,
  })

  const { data: statusData, isLoading: statusLoading } = useQuery({
    queryKey: ["status-distribution", dateParams],
    queryFn: () => api.getStatusDistribution(),
    staleTime: 1000 * 60 * 5,
  })

  // Transform overview data for PerformanceMetrics
  const overviewMetrics = overviewData
    ? {
        total_attempts: overviewData.total_attempts || 0,
        total_amount: overviewData.amount?.total_rials || 0,
        success_rate: overviewData.success_rate || 0,
        total_fees: overviewData.adjusted_fee_total || 0,
        unique_sessions: overviewData.unique_sessions || 0,
        failure_rate: overviewData.failure_rate || 0,
        avg_amount: overviewData.amount?.avg_per_attempt_rials || 0,
      }
    : null

  // Transform recommendations for RecommendationPanel
  const transformedRecommendations = recommendations
    ? recommendations.map((rec: any) => ({
        type: rec.performance_tier === 'high' ? 'optimization' : rec.performance_tier === 'medium' ? 'growth' : 'risk',
        title: `${rec.merchant_key} - ${rec.performance_tier} عملکرد`,
        description: rec.recommendations.join(' | '),
        priority: rec.performance_tier === 'low' ? 'بحرانی' : rec.performance_tier === 'medium' ? 'متوسط' : 'بالا',
        action: rec.recommendations[0] || '',
      }))
    : null

  // Calculate merchant sales share data
  const merchantSalesShare = merchantData
    ? merchantData.map((m: any, index: number) => ({
        ...m,
        rank: index + 1,
        total_amount: m.total_amount || m.total_revenue_rial || 0,
      }))
    : []

  const totalSales = merchantSalesShare.reduce((sum, m) => sum + (m.total_amount || 0), 0)

  const handleMerchantChange = (merchant: string | null) => {
    setSelectedMerchant(merchant)
  }

  const handleDateChange = (start: string | null, end: string | null) => {
    setStartDate(start)
    setEndDate(end)
  }

  const handleClearFilters = () => {
    setSelectedMerchant(null)
    setStartDate(null)
    setEndDate(null)
  }

  // Active filters count
  const activeFiltersCount = [selectedMerchant, startDate, endDate].filter(Boolean).length

  const merchantFilterNode = (
    <MerchantSelector
      selectedMerchant={selectedMerchant}
      onSelect={handleMerchantChange}
      onRefresh={refetchOverview}
    />
  )

  const dateFilterNode = (
    <DateRangeFilter
      startDate={startDate}
      endDate={endDate}
      onChange={handleDateChange}
      onClear={handleClearFilters}
    />
  )

  return (
    <DashboardLayout
      merchantFilter={merchantFilterNode}
      dateFilter={dateFilterNode}
    >
      {/* Active filters indicator */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 px-4 sm:px-0">
          {selectedMerchant && (
            <Badge variant="secondary" className="text-xs">
              فروشگاه: {selectedMerchant}
            </Badge>
          )}
          {startDate && (
            <Badge variant="secondary" className="text-xs">
              از: {toPersianNumber(startDate)}
            </Badge>
          )}
          {endDate && (
            <Badge variant="secondary" className="text-xs">
              تا: {toPersianNumber(endDate)}
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="text-xs h-6 px-2"
          >
            <Filter className="h-3 w-3 mr-1" />
            پاک کردن فیلترها
          </Button>
        </div>
      )}

      {/* Data limitation warning (compact) */}
      <div className="px-4 sm:px-0">
        <DataLimitationWarning compact />
      </div>

      {/* Hero Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          داشبورتر تحلیلی زرین‌پال
        </h1>
        <p className="text-muted-foreground">
          تحلیل هوشمند داده‌های پرداخت شما با هوش مصنوعی — Nowruz 1405 Analytics
        </p>
      </div>

      <Separator className="my-6" />

      {/* Section 1: Overview KPIs */}
      <section aria-labelledby="kpi-section">
        <div className="flex items-center justify-between mb-4">
          <h2 id="kpi-section" className="text-lg font-semibold text-foreground flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <span>شاخص‌های کلان</span>
          </h2>
          <CalculationDetails showTooltip metricType="adjusted-fee" />
        </div>
        {overviewLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : (
          <PerformanceMetrics data={overviewMetrics} />
        )}
      </section>

      {/* Section 2: AI-Powered Section */}
      <section aria-labelledby="ai-section">
        <div className="flex items-center justify-between mb-4">
          <h2 id="ai-section" className="text-lg font-semibold text-foreground flex items-center gap-2">
            <span>🤖</span>
            <span>هوش مصنوعی و پیش‌بینی</span>
          </h2>
          <Button variant="outline" size="sm" asChild>
            <Link href="/ai-dashboard">
              <span>داشبورد AI</span>
              <Brain className="h-3 w-3 mr-1" />
            </Link>
          </Button>
        </div>
        <Suspense fallback={<Skeleton className="h-96 w-full" />}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AIInsightsCard />
            <AnomalyDetector />
          </div>
        </Suspense>
      </section>

      {/* Three-column AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Suspense fallback={<Skeleton className="h-64 w-full" />}>
          <SpendingPatternsChart />
        </Suspense>
        <Suspense fallback={<Skeleton className="h-64 w-full" />}>
          <AnomalyDetector />
        </Suspense>
        <Suspense fallback={<Skeleton className="h-64 w-full" />}>
          <RiskAlertCard />
        </Suspense>
      </div>

      {/* Section 3: Nowruz Analytics */}
      <section aria-labelledby="nowruz-section">
        <div className="flex items-center justify-between mb-4">
          <h2 id="nowruz-section" className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            <span>تحلیلات نوروزی ۱۴۰۵</span>
          </h2>
          <Button variant="outline" size="sm" asChild>
            <Link href="/nowruz-dashboard">
              <span>داشبورد کامل نوروز</span>
            </Link>
          </Button>
        </div>
        <Suspense fallback={<Skeleton className="h-96 w-full" />}>
          <NowruzAnalysis />
        </Suspense>
      </section>

      {/* Section 4: Category Distribution + Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Distribution Table */}
        <section aria-labelledby="category-section">
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-primary" />
                <span>توزیع دسته‌بندی‌ها</span>
              </CardTitle>
              <CardDescription>
                توزیع تلاش‌ها و مبالغ بر اساس دسته‌بندی کسب‌وکار
              </CardDescription>
            </CardHeader>
            <CardContent>
              {categoryLoading ? (
                <Skeleton className="h-48 w-full" />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-right py-2">#</th>
                        <th className="text-right py-2">دسته‌بندی</th>
                        <th className="text-right py-2">تلاش‌ها</th>
                        <th className="text-right py-2">فروشگاه‌ها</th>
                        <th className="text-right py-2">مبلغ کل</th>
                        <th className="text-right py-2">نرخ موفقیت</th>
                        <th className="text-right py-2">سهم</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(categoryData || []).map((cat: any, index: number) => (
                        <tr key={cat.category_id || index} className="border-b hover:bg-muted/30">
                          <td className="py-2">{toPersianNumber(index + 1)}</td>
                          <td className="py-2">{cat.category_title || "—"}</td>
                          <td className="py-2">{toPersianNumber(cat.total_attempts || 0)}</td>
                          <td className="py-2">{toPersianNumber(cat.merchant_count || 0)}</td>
                          <td className="py-2">{formatCurrencyIRToman(cat.total_amount || 0)}</td>
                          <td className="py-2">{toPersianNumber((cat.success_rate_pct || 0).toFixed(1))}%</td>
                          <td className="py-2">{formatPercentValue(cat.share_pct || 0)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Status Breakdown Table */}
        <section aria-labelledby="status-section">
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Grid3X3 className="h-5 w-5 text-primary" />
                <span>توزیع وضعیت‌ها</span>
              </CardTitle>
              <CardDescription>
                تعداد تلاش‌ها بر اساس وضعیت نهایی سشن
              </CardDescription>
            </CardHeader>
            <CardContent>
              {statusLoading ? (
                <Skeleton className="h-48 w-full" />
              ) : (
                <div className="space-y-2">
                  {(statusData || []).map((s: any, index: number) => {
                    const STATUS_COLORS: Record<string, string> = {
                      Verified: "text-green-400 bg-green-500/10",
                      Paid: "text-blue-400 bg-blue-500/10",
                      InBank: "text-yellow-400 bg-yellow-500/10",
                      Failed: "text-red-400 bg-red-500/10",
                      Reversed: "text-orange-400 bg-orange-500/10",
                      NoAttempt: "text-gray-400 bg-gray-500/10",
                    }
                    const colorClass = STATUS_COLORS[s.session_status] || "text-muted-foreground bg-muted/20"
                    return (
                      <div key={s.session_status || index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                        <Badge className={colorClass}>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span>{s.session_status || "Unknown"}</span>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="text-xs max-w-xs text-right">
                                {s.session_status === "Verified" && "پرداخت تأیید شده توسط فروشگاه"}
                                {s.session_status === "Paid" && "پرداخت کامل انجام شده"}
                                {s.session_status === "InBank" && "در حال انتقال به بانک"}
                                {s.session_status === "Failed" && "پرداخت ناموفق"}
                                {s.session_status === "Reversed" && "پرداخت برگشت داده شده"}
                                {s.session_status === "NoAttempt" && "بدون تلاش پرداخت"}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </Badge>
                        <span className="font-medium">{toPersianNumber(s.count || 0)}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>

      {/* Section 5: Transaction Trends */}
      <section aria-labelledby="trends-section">
        <div className="flex items-center justify-between mb-4">
          <h2 id="trends-section" className="text-lg font-semibold text-foreground flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span>روند تراکنش‌ها (تمام دوره داده)</span>
          </h2>
        </div>
        <Suspense fallback={<Skeleton className="h-[330px] w-full" />}>
          <TransactionTrends
            data={timeSeriesData && amountSeriesData ? { count: timeSeriesData, amount: amountSeriesData } : timeSeriesData}
            maxDays={365}
          />
        </Suspense>
      </section>

      {/* Section 6: Merchant Sales Share Table */}
      <section aria-labelledby="sales-share-section">
        <div className="flex items-center justify-between mb-4">
          <h2 id="sales-share-section" className="text-lg font-semibold text-foreground flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <span>سهم فروش فروشگاه‌ها</span>
          </h2>
        </div>
        <Card className="bg-card/50 border-border/50">
          <CardContent>
            {merchantLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-right py-2">#</th>
                      <th className="text-right py-2">کلید فروشگاه</th>
                      <th className="text-right py-2">دسته‌بندی</th>
                      <th className="text-right py-2">تلاش‌ها</th>
                      <th className="text-right py-2">مبلغ کل</th>
                      <th className="text-right py-2">نرخ موفقیت</th>
                      <th className="text-right py-2">سهم فروش</th>
                      <th className="text-center py-2">عملیات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {merchantData?.map((m: any, index: number) => {
                      const amount = m.total_amount || 0
                      const share = totalSales > 0 ? (amount / totalSales) * 100 : 0
                      return (
                        <tr key={m.merchant_key} className="border-b hover:bg-muted/30">
                          <td className="py-2">{toPersianNumber(index + 1)}</td>
                          <td className="py-2 font-mono">{m.merchant_key}</td>
                          <td className="py-2">{m.category_title || "—"}</td>
                          <td className="py-2">{toPersianNumber(m.total_attempts || 0)}</td>
                          <td className="py-2">{formatCurrencyIRToman(amount)}</td>
                          <td className="py-2">{toPersianNumber((m.success_rate_pct || 0).toFixed(1))}%</td>
                          <td className="py-2">{formatPercentValue(share)}</td>
                          <td className="py-2 text-center">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button size="sm" variant="outline" asChild>
                                    <Link href={`/merchant/${m.merchant_key}`}>
                                      <ArrowRight className="h-3 w-3" />
                                    </Link>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="text-xs">
                                  جزئیات فروشگاه
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Section 7 & 8: Merchant Ranking + Peer Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section aria-labelledby="ranking-section">
          <div className="flex items-center justify-between mb-4">
            <h2 id="ranking-section" className="text-lg font-semibold text-foreground flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <span>رتبه فروشگاه‌ها</span>
            </h2>
          </div>
          <Suspense fallback={<Skeleton className="h-80 w-full" />}>
            <MerchantRanking
              onMerchantSelect={(merchant) => setSelectedMerchant(merchant)}
            />
          </Suspense>
        </section>

        <section aria-labelledby="peer-section">
          <div className="flex items-center justify-between mb-4">
            <h2 id="peer-section" className="text-lg font-semibold text-foreground">
              مقایسه با همتایان
            </h2>
          </div>
          <Suspense fallback={<Skeleton className="h-80 w-full" />}>
            <PeerComparison
              merchantKey={selectedMerchant || (merchantData && merchantData[0]?.merchant_key) || null}
            />
          </Suspense>
        </section>
      </div>

      {/* Section 6 (from spec): High-Value Payments Analysis */}
      <section aria-labelledby="high-value-section">
        <div className="flex items-center justify-between mb-4">
          <h2 id="high-value-section" className="text-lg font-semibold text-foreground flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <span>تحلیل پرداخت‌های با ارزش بالا (۱۰ میلیون+ ریال)</span>
          </h2>
        </div>
        <HighValueAnalysis data={highValueData} loading={!highValueData} />
      </section>

      {/* Section 9: Recommendations */}
      <section aria-labelledby="recommendations-section">
        <div className="flex items-center justify-between mb-4">
          <h2 id="recommendations-section" className="text-lg font-semibold text-foreground">
            پیشنهادات هوشمند
          </h2>
        </div>
        <Suspense fallback={<Skeleton className="h-80 w-full" />}>
          <RecommendationPanel data={transformedRecommendations} />
        </Suspense>
      </section>

      {/* Section: AI Chat */}
      <section aria-labelledby="chat-section">
        <div className="flex items-center justify-between mb-4">
          <h2 id="chat-section" className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            <span>دستیار هوش مصنوعی</span>
          </h2>
        </div>
        <Suspense fallback={<Skeleton className="h-[500px] w-full" />}>
          <AIChat />
        </Suspense>
      </section>

      {/* Section: Data Provenance */}
      <section aria-labelledby="provenance-section">
        <div className="flex items-center justify-between mb-4">
          <h2 id="provenance-section" className="text-lg font-semibold text-foreground">
            ردیابی محاسبات
          </h2>
        </div>
        <Suspense fallback={<Skeleton className="h-40 w-full" />}>
          <DataProvenance />
        </Suspense>
      </section>

      {/* Full Data Limitation Warning */}
      <section>
        <DataLimitationWarning />
      </section>
    </DashboardLayout>
  )
}

// High-Value Analysis component
function HighValueAnalysis({ data, loading }: { data?: any; loading: boolean }) {
  if (loading) {
    return <Skeleton className="h-64 w-full" />
  }
  if (!data) {
    return (
      <Card className="bg-card/50 border-border/50">
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground py-8">داده‌ای یافت نشد</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              پرداخت‌های با ارزش بالا
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {toPersianNumber(data.high_value_attempts || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              از {toPersianNumber(data.total_attempts || 0)} تلاش
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              درصد از مبلغ کل
            </CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatPercentValue(data.pct_of_amount || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatPercentValue(data.pct_of_attempts || 0)} از تلاش‌ها
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              مبلغ با ارزش بالا
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatCurrencyIRToman(data.high_value_amount || 0)}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              میانگین پرداخت با ارزش بالا
            </CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatCurrencyIRToman(
                data.high_value_attempts > 0
                  ? (data.high_value_amount || 0) / data.high_value_attempts
                  : 0
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* By Merchant Table */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle>برترین فروشگاه‌ها (پرداخت‌های با ارزش بالا)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-right py-2">#</th>
                  <th className="text-right py-2">کلید فروشگاه</th>
                  <th className="text-right py-2">تعداد</th>
                  <th className="text-right py-2">مبلغ کل</th>
                  <th className="text-right py-2">میانگین</th>
                </tr>
              </thead>
              <tbody>
                {(data.by_merchant || []).map((m: any, index: number) => (
                  <tr key={m.merchant_key || index} className="border-b">
                    <td className="py-2">{toPersianNumber(index + 1)}</td>
                    <td className="py-2 font-mono">{m.merchant_key}</td>
                    <td className="py-2">{toPersianNumber(m.cnt || 0)}</td>
                    <td className="py-2">{formatCurrencyIRToman(m.amt || 0)}</td>
                    <td className="py-2">
                      {m.cnt > 0 ? formatCurrencyIRToman((m.amt || 0) / m.cnt) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* By Category Table */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle>توزیع بر اساس دسته‌بندی</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-right py-2">#</th>
                  <th className="text-right py-2">دسته‌بندی</th>
                  <th className="text-right py-2">تعداد</th>
                  <th className="text-right py-2">مبلغ</th>
                </tr>
              </thead>
              <tbody>
                {(data.by_category || []).map((c: any, index: number) => (
                  <tr key={c.category_title || index} className="border-b">
                    <td className="py-2">{toPersianNumber(index + 1)}</td>
                    <td className="py-2">{c.category_title || "—"}</td>
                    <td className="py-2">{toPersianNumber(c.cnt || 0)}</td>
                    <td className="py-2">{formatCurrencyIRToman(c.amt || 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Status Breakdown */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle>وضعیت پرداخت‌های با ارزش بالا</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {(data.status_breakdown || []).map((s: any) => (
              <div key={s.session_status || "unknown"} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <Badge variant="outline">{s.session_status || "Unknown"}</Badge>
                <div className="text-right">
                  <span className="font-medium">{toPersianNumber(s.cnt || 0)}</span>
                  <span className="text-xs text-muted-foreground mr-2">
                    ({formatCurrencyIRToman(s.amt || 0)})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {data.how_calculated && (
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="text-sm">چگونه محاسبه شد؟</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 text-xs text-muted-foreground">
              {Object.entries(data.how_calculated).map(([key, value]) => (
                <div key={key} className="flex justify-between py-1 border-b last:border-0">
                  <code className="text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground" dir="ltr">
                    {key}
                  </code>
                  <span>{value as string}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

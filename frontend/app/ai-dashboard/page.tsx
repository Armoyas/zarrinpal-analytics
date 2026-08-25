"use client"

export const dynamic = "force-dynamic"

import { Suspense } from "react"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { PerformanceMetrics } from "@/components/dashboard/PerformanceMetrics"
import { TransactionTrends } from "@/components/dashboard/TransactionTrends"
import { MerchantRanking } from "@/components/dashboard/MerchantRanking"
import { RecommendationPanel } from "@/components/dashboard/RecommendationPanel"
import { AIInsightsCard } from "@/components/dashboard/AIInsightsCard"
import { AnomalyDetector } from "@/components/dashboard/AnomalyDetector"
import { RiskAlertCard } from "@/components/dashboard/RiskAlertCard"
import { NowruzAnalysis } from "@/components/dashboard/NowruzAnalysis"
import { SpendingPatternsChart } from "@/components/dashboard/SpendingPatternsChart"
import { PredictionChart } from "@/components/dashboard/PredictionChart"
import { DataProvenance } from "@/components/dashboard/DataProvenance"
import { AIChat } from "@/components/dashboard/AIChat"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { Brain, Sparkles, BarChart3, TrendingUp, Gift, AlertTriangle, Activity, Bot } from "lucide-react"
import Link from "next/link"

export default function AIDashboardPage() {
  const { data: overviewData } = useQuery({
    queryKey: ["overview-ai"],
    queryFn: () => api.getOverview(),
  })

  const { data: recommendations } = useQuery({
    queryKey: ["smart-recommendations-ai"],
    queryFn: () => api.getSmartRecommendations(10),
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

  return (
    <div className="container mx-auto py-4 space-y-8 px-4 md:px-6">
      {/* Hero Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
          <Brain className="h-8 w-8 text-primary" />
          داشبورد هوش مصنوعی زرین‌پال
        </h1>
        <p className="text-muted-foreground">
          تحلیل هوشمند داده‌های پرداخت شما با هوش مصنوعی — Nowruz 1405 Analytics
        </p>
      </div>

      <Separator className="my-6" />

      {/* AI-Powered Section - Top Priority */}
      <section>
        <h2 className="text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <span>هوش مصنوعی و پیش‌بینی</span>
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Suspense fallback={<Skeleton className="h-80 w-full" />}>
            <AIInsightsCard />
          </Suspense>
          <Suspense fallback={<Skeleton className="h-80 w-full" />}>
            <PredictionChart />
          </Suspense>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <Suspense fallback={<Skeleton className="h-80 w-full" />}>
            <AnomalyDetector />
          </Suspense>
          <Suspense fallback={<Skeleton className="h-80 w-full" />}>
            <RiskAlertCard />
          </Suspense>
        </div>
        <div className="mt-6">
          <Suspense fallback={<Skeleton className="h-96 w-full" />}>
            <AIChat />
          </Suspense>
        </div>
      </section>

      {/* Nowruz Analytics */}
      <section>
        <h2 className="text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
          <Gift className="h-5 w-5 text-primary" />
          <span>تحلیلات نوروزی ۱۴۰۵</span>
        </h2>
        <Suspense fallback={<Skeleton className="h-96 w-full" />}>
          <NowruzAnalysis />
        </Suspense>
      </section>

      {/* Spending Patterns Chart */}
      <section>
        <h2 className="text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <span>تحلیل الگوهای مصرف</span>
        </h2>
        <Suspense fallback={<Skeleton className="h-80 w-full" />}>
          <SpendingPatternsChart />
        </Suspense>
      </section>

      {/* Performance Metrics */}
      <section>
        <h2 className="text-lg font-semibold mb-4 text-foreground">
          شاخص‌های کلان
        </h2>
        <Suspense fallback={<Skeleton className="h-40 w-full" />}>
          <PerformanceMetrics data={overviewMetrics} />
        </Suspense>
      </section>

      {/* Transaction Trends */}
      <section>
        <h2 className="text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <span>روند تراکنش‌ها</span>
        </h2>
        <Suspense fallback={<Skeleton className="h-80 w-full" />}>
          <TransactionTrends />
        </Suspense>
      </section>

      {/* Merchant Ranking */}
      <section>
        <h2 className="text-lg font-semibold mb-4 text-foreground">
          رتبه فروشگاه‌ها
        </h2>
        <Suspense fallback={<Skeleton className="h-80 w-full" />}>
          <MerchantRanking />
        </Suspense>
      </section>

      {/* Recommendations */}
      <section>
        <h2 className="text-lg font-semibold mb-4 text-foreground">
          پیشنهادات هوشمند
        </h2>
        <Suspense fallback={<Skeleton className="h-80 w-full" />}>
          <RecommendationPanel data={transformedRecommendations} />
        </Suspense>
      </section>

      {/* Data Provenance */}
      <section>
        <Suspense fallback={<Skeleton className="h-40 w-full" />}>
          <DataProvenance />
        </Suspense>
      </section>
    </div>
  )
}

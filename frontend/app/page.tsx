import { Suspense } from "react"
import { PerformanceMetrics } from "@/components/dashboard/PerformanceMetrics"
import { TransactionTrends } from "@/components/dashboard/TransactionTrends"
import { MerchantRanking } from "@/components/dashboard/MerchantRanking"
import { PeerComparison } from "@/components/dashboard/PeerComparison"
import { RecommendationPanel } from "@/components/dashboard/RecommendationPanel"
import { AIPanel } from "@/components/dashboard/AIPanel"
import { NowruzAnalysis } from "@/components/dashboard/NowruzAnalysis"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"

export default function DashboardPage() {
  // Use mock data for demo (in production, this would come from the API)
  const mockOverview = {
    total_transactions: 12487,
    total_amount: 4842000000,
    success_rate: 94.2,
    total_fees: 1453200,
  }

  const mockTimeSeries = Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000),
    count: Math.floor(Math.random() * 100) + 200,
    amount: Math.floor(Math.random() * 50000000) + 100000000,
  }))

  const mockMerchants = Array.from({ length: 20 }, (_, i) => ({
    merchant_key: `merchant_${100 + i}`,
    transaction_count: Math.floor(Math.random() * 500) + 100,
    total_amount: Math.floor(Math.random() * 200000000) + 50000000,
    status: ["Verified", "Paid", "InBank", "Failed"][Math.floor(Math.random() * 4)],
  }))

  const mockPeerData = {
    current_user: {
      success_rate: 94.2,
      avg_transaction: 387500,
      refund_rate: 2.1,
    },
    peer_avg_transaction: 325000,
    percentile: 87,
  }

  const mockRecommendations = [
    {
      type: "optimization",
      title: "بهینه‌سازی نرخ تبدیل",
      description: "نرخ تبدیل پرداخت شما ۲.۳٪ پایین‌تر از میانگین صنعتی است. استفاده از صفحات پرداخت بهینه‌شده می‌تواند تا ۱۵٪ بهبود بخشد.",
      priority: "بالا",
      action: "بهینه‌سازی شکل‌نماهای پرداختی که بیشترین از دست رفتگی را دارند",
    },
    {
      type: "security",
      title: "بررسی امنیت تراکنش‌ها",
      description: "۳۲ تراکنش مشکوک در ۲۴ ساعت گذشته شناسایی شده است. این الگوهای رفتاری را بررسی کنید.",
      priority: "بحرانی",
      action: "مرور تراکنش‌های مشکوک و اعمال فیلتر مناسب",
    },
    {
      type: "growth",
      title: "گسترش به بازارهای جدید",
      description: "فصل بهار و عید نوروز فرصتی استثنایی برای افزایش فروش است. هدف‌گذاری ۴۰٪ رشد نسبت به سال گذشته.",
      priority: "متوسط",
      action: "برنامه‌ریزی کمپین ویژه نوروز با تخفیفات جذاب",
    },
  ]

  return (
    <div className="container mx-auto py-4 space-y-8 px-4 md:px-6">
      {/* Hero Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          داشبورد تحلیلی زرین‌پال
        </h1>
        <p className="text-muted-foreground">
          تحلیل هوشمند داده‌های پرداخت شما با هوش مصنوعی
        </p>
      </div>

      <Separator className="my-6" />

      {/* Performance Metrics */}
      <section>
        <h2 className="text-lg font-semibold mb-4 text-foreground">
          شاخص‌های کلان
        </h2>
        <Suspense fallback={<Skeleton className="h-40 w-full" />}>
          <PerformanceMetrics data={mockOverview} />
        </Suspense>
      </section>

      {/* AI-Powered Section */}
      <section>
        <h2 className="text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
          <span>🤖</span>
          <span>هوش مصنوعی و پیش‌بینی</span>
        </h2>
        <Suspense fallback={<Skeleton className="h-64 w-full" />}>
          <AIPanel />
        </Suspense>
      </section>

      {/* Nowruz Analytics */}
      <section>
        <h2 className="text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
          <span>🎉</span>
          <span>تحلیلات نوروزی</span>
        </h2>
        <Suspense fallback={<Skeleton className="h-64 w-full" />}>
          <NowruzAnalysis />
        </Suspense>
      </section>

      {/* Transaction Trends */}
      <section>
        <h2 className="text-lg font-semibold mb-4 text-foreground">
          روند تراکنش‌ها
        </h2>
        <Suspense fallback={<Skeleton className="h-80 w-full" />}>
          <TransactionTrends data={mockTimeSeries} />
        </Suspense>
      </section>

      {/* Two-column layout: Merchant Ranking + Peer Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section>
          <h2 className="text-lg font-semibold mb-4 text-foreground">
            رتبه فروشگاه‌ها
          </h2>
          <Suspense fallback={<Skeleton className="h-80 w-full" />}>
            <MerchantRanking data={mockMerchants} />
          </Suspense>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4 text-foreground">
            مقایسه با همتاها
          </h2>
          <Suspense fallback={<Skeleton className="h-80 w-full" />}>
            <PeerComparison data={mockPeerData} />
          </Suspense>
        </section>
      </div>

      {/* Recommendations */}
      <section>
        <h2 className="text-lg font-semibold mb-4 text-foreground">
          پیشنهادات هوشمند
        </h2>
        <Suspense fallback={<Skeleton className="h-80 w-full" />}>
          <RecommendationPanel data={mockRecommendations} />
        </Suspense>
      </section>
    </div>
  )
}

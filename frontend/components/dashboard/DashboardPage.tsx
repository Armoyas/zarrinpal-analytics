'use client'

import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { PerformanceMetrics } from '@/components/dashboard/PerformanceMetrics'
import { TransactionTrends } from '@/components/dashboard/TransactionTrends'
import { MerchantRanking } from '@/components/dashboard/MerchantRanking'
import { PeerComparison } from '@/components/dashboard/PeerComparison'
import { RecommendationPanel } from '@/components/dashboard/RecommendationPanel'
import { NowruzAnalysis } from '@/components/dashboard/NowruzAnalysis'
import { DataProvenance } from '@/components/dashboard/DataProvenance'

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="animate-fade-in-up">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">داشبورد پذیرنده</p>
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">نمای کلی عملکرد شما</h2>
            <p className="max-w-xl text-sm text-muted-foreground">
              هر عدد قابل‌ردیابی است — روی آیکن اطلاعات هر متریک نگه دارید تا فرمول محاسبه را ببینید.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-soft">
              بازه تحلیل: <span className="num font-semibold text-foreground">۹۰</span> روز اخیر
            </span>
          </div>
        </div>
      </div>

      <section id="overview" className="scroll-mt-20">
        <PerformanceMetrics />
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section id="trends" className="scroll-mt-20 lg:col-span-2">
          <TransactionTrends />
        </section>
        <section id="peers" className="scroll-mt-20">
          <PeerComparison />
        </section>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section id="ranking" className="scroll-mt-20 lg:col-span-2">
          <MerchantRanking />
        </section>
        <div className="space-y-6">
          <section id="recommendations" className="scroll-mt-20">
            <RecommendationPanel />
          </section>
          <section id="nowruz" className="scroll-mt-20">
            <NowruzAnalysis />
          </section>
        </div>
      </div>

      <section id="provenance" className="scroll-mt-20">
        <DataProvenance />
      </section>
    </DashboardLayout>
  )
}

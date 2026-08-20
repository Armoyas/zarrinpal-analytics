'use client'

import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { PerformanceMetrics } from '@/components/dashboard/PerformanceMetrics'
import { TransactionTrends } from '@/components/dashboard/TransactionTrends'
import { MerchantRanking } from '@/components/dashboard/MerchantRanking'
import { RecommendationPanel } from '@/components/dashboard/RecommendationPanel'
import { NowruzAnalysis } from '@/components/dashboard/NowruzAnalysis'
import { PeerComparison } from '@/components/dashboard/PeerComparison'
import { DataProvenance } from '@/components/dashboard/DataProvenance'

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <section id="overview">
        <PerformanceMetrics />
      </section>
      <section id="trends">
        <TransactionTrends />
      </section>
      <section id="nowruz">
        <NowruzAnalysis />
      </section>
      <section id="recommendations">
        <RecommendationPanel />
      </section>
      <section id="peers">
        <PeerComparison />
      </section>
      <section id="ranking">
        <MerchantRanking />
      </section>
      <section id="provenance">
        <DataProvenance />
      </section>
    </DashboardLayout>
  )
}

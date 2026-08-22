"use client";

import { useState, useEffect } from "react";
import { MerchantSelector } from "@/components/MerchantSelector";
import { DateRangeFilter } from "@/components/DateRangeFilter";
import { KpiCard } from "@/components/KpiCard";
import { DailyTrendChart } from "@/components/DailyTrendChart";
import { AmountTrendChart } from "@/components/AmountTrendChart";
import { DataLimitationWarning } from "@/components/DataLimitationWarning";
import { CalculationDetails } from "@/components/CalculationDetails";
import {
  MerchantInfo,
  MetricTrace,
  OverviewResponse,
  TrendsResponse,
  SalesShareResponse,
  ActivityResponse,
  MerchantRankingResponse,
} from "@/app/types";
import {
  fetchOverview,
  fetchMerchants,
  fetchTrends,
  fetchSalesShare,
  fetchActivity,
  fetchMerchantRanking,
} from "@/lib/api";
import { BarChart3, TrendingUp, Users, Calendar, Award, Clock } from "lucide-react";

type Tab = "overview" | "share" | "activity" | "ranking";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [selectedMerchant, setSelectedMerchant] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [merchants, setMerchants] = useState<MerchantInfo[]>([]);
  const [overviewData, setOverviewData] = useState<OverviewResponse | null>(null);
  const [trendsData, setTrendsData] = useState<TrendsResponse | null>(null);
  const [salesShareData, setSalesShareData] = useState<SalesShareResponse | null>(null);
  const [activityData, setActivityData] = useState<ActivityResponse | null>(null);
  const [rankingData, setRankingData] = useState<MerchantRankingResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<MetricTrace | null>(null);

  // Fetch merchants on mount
  useEffect(() => {
    const loadMerchants = async () => {
      try {
        const data = await fetchMerchants();
        setMerchants(data.merchants);
        if (data.merchants.length > 0) {
          setSelectedMerchant(data.merchants[0].merchant_key);
        }
      } catch (err: any) {
        setError(err.message);
      }
    };
    loadMerchants();
  }, []);

  // Fetch data when filters change
  useEffect(() => {
    if (!selectedMerchant) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [overview, trends, share, activity, ranking] = await Promise.all([
          fetchOverview(selectedMerchant, startDate, endDate),
          fetchTrends(selectedMerchant, startDate, endDate),
          fetchSalesShare("merchant", selectedMerchant, startDate, endDate),
          fetchActivity(selectedMerchant, "daily", startDate, endDate),
          fetchMerchantRanking("amount", selectedMerchant, startDate, endDate),
        ]);
        setOverviewData(overview);
        setTrendsData(trends);
        setSalesShareData(share);
        setActivityData(activity);
        setRankingData(ranking);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedMerchant, startDate, endDate]);

  const getMetricValue = (metricId: string) => {
    const metric = overviewData?.metrics?.find((m) => m.metric_id === metricId);
    return metric ? metric.value : 0;
  };

  const formatNumber = (num: number) => {
    if (num >= 1e9) return (num / 1e9).toFixed(1) + " میلیارد";
    if (num >= 1e6) return (num / 1e6).toFixed(1) + " میلیون";
    if (num >= 1000) return (num / 1000).toFixed(1) + " هزار";
    return num.toString();
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat("fa-IR").format(num) + " ریال";
  };

  const getSelectedMetric = (metricId: string): MetricTrace | null => {
    return overviewData?.metrics?.find((m) => m.metric_id === metricId) ?? null;
  };

  // --- Stage 2 rendering helpers ---
  const renderSalesShareTab = () => {
    if (loading) return <LoadingCard />;
    if (error) return <ErrorCard error={error} />;
    if (!salesShareData) return <EmptyCard />;

    const shares = salesShareData.merchant_shares || [];
    const aggregate = salesShareData.aggregate || {};

    return (
      <div className="space-y-6">
        {/* Aggregate KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KpiCard
            title="مجموع فروش موفق"
            value={formatCurrency(Number(aggregate.total_sales_amount) || 0)}
            metricId="total_sales_amount"
            onClick={() =>
              setSelectedMetric({
                metric_id: "total_sales_amount",
                label: "مجموع فروش موفق",
                value: aggregate.total_sales_amount,
                definition: salesShareData.traceability?.definition || "",
                formula: salesShareData.traceability?.formula || "",
                source_columns: salesShareData.traceability?.source_columns || [],
                counting_unit: salesShareData.traceability?.counting_unit || "row",
                filters: salesShareData.traceability?.filters || {},
                limitations: salesShareData.traceability?.limitations || null,
              } as MetricTrace)}
          />
          <KpiCard
            title="کل تلاش‌ها"
            value={formatNumber(Number(aggregate.total_attempts) || 0)}
            metricId="total_attempts"
            onClick={() =>
              setSelectedMetric({
                metric_id: "total_attempts",
                label: "کل تلاش‌ها",
                value: aggregate.total_attempts,
                definition: "تعداد کل ردیف‌های پرداخت",
                formula: "COUNT(*)",
                source_columns: ["session_key", "amount"],
                counting_unit: "row",
                filters: {},
                limitations: null,
              } as MetricTrace)}
          />
          <KpiCard
            title="نرخ موفقیت"
            value={(Number(aggregate.aggregate_success_rate) || 0) + "٪"}
            metricId="success_rate"
            onClick={() =>
              setSelectedMetric({
                metric_id: "success_rate",
                label: "نرخ موفقیت",
                value: aggregate.aggregate_success_rate,
                definition: "نسبت پرداخت‌های موفق به کل تلاش‌ها",
                formula: "COUNT(successful) / COUNT(*) * 100",
                source_columns: ["session_status"],
                counting_unit: "row",
                filters: {},
                limitations: null,
              } as MetricTrace)}
          />
          <KpiCard
            title="فروشندگان"
            value={shares.length + " عدد"}
            metricId="merchant_count"
            onClick={() =>
              setSelectedMetric({
                metric_id: "merchant_count",
                label: "فروشندگان",
                value: shares.length,
                definition: "تعداد فروشندگان با فروش موفق",
                formula: "COUNT(DISTINCT merchant_key)",
                source_columns: ["merchant_key"],
                counting_unit: "merchant",
                filters: {},
                limitations: null,
              } as MetricTrace)}
          />
        </div>

        {/* Sales Share Table */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-sky-400" />
            درصد فروش موفق بر حسب فروشنده
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-right">
              <thead>
                <tr className="border-b border-slate-700 text-slate-300">
                  <th className="pb-2">ردیف</th>
                  <th className="pb-2">کلید فروشنده</th>
                  <th className="pb-2">فروش موفق (ریال)</th>
                  <th className="pb-2">درصد فروش</th>
                  <th className="pb-2">تلاش‌ها</th>
                  <th className="pb-2">نرخ موفقیت</th>
                </tr>
              </thead>
              <tbody>
                {shares.map((s: any, i: number) => (
                  <tr key={s.group_key || i} className="border-b border-slate-800">
                    <td className="py-2">{i + 1}</td>
                    <td className="py-2 text-sky-400">{s.group_key}</td>
                    <td className="py-2">{formatCurrency(Number(s.sales_amount) || 0)}</td>
                    <td className="py-2">{Number(s.sales_share_pct) || 0}٪</td>
                    <td className="py-2">{formatNumber(Number(s.attempt_count) || 0)}</td>
                    <td className="py-2">{Number(s.success_rate) || 0}٪</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderActivityTab = () => {
    if (loading) return <LoadingCard />;
    if (error) return <ErrorCard error={error} />;
    if (!activityData) return <EmptyCard />;

    const daily = activityData.daily_activity || [];
    const traceability = activityData.traceability;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KpiCard
            title="تعداد روزها"
            value={daily.length + " روز"}
            metricId="active_days"
            onClick={() => setSelectedMetric({
              metric_id: "active_days",
              label: "تعداد روزها",
              value: daily.length,
              definition: "تعداد روزهای منحصر به فرد با فعالیت",
              formula: "COUNT(DISTINCT date)",
              source_columns: ["created_at"],
              counting_unit: "day",
              filters: {},
              limitations: null,
            } as MetricTrace)}
          />
          <KpiCard
            title="کل تلاش‌ها"
            value={formatNumber(daily.reduce((sum, d) => sum + Number(d.attempts), 0))}
            metricId="total_attempts_activity"
            onClick={() => setSelectedMetric({
              metric_id: "total_attempts_activity",
              label: "کل تلاش‌ها",
              value: daily.reduce((sum, d) => sum + Number(d.attempts), 0),
              definition: "مجموع تمام تلاش‌ها در بازه انتخابی",
              formula: "SUM(attempts)",
              source_columns: ["created_at", "session_key"],
              counting_unit: "row",
              filters: {},
              limitations: null,
            } as MetricTrace)}
          />
          <KpiCard
            title="کل مبلغ"
            value={formatCurrency(daily.reduce((sum, d) => sum + Number(d.amount), 0))}
            metricId="total_amount_activity"
            onClick={() => setSelectedMetric({
              metric_id: "total_amount_activity",
              label: "کل مبلغ",
              value: daily.reduce((sum, d) => sum + Number(d.amount), 0),
              definition: "مجموع تمام مبالغ در بازه انتخابی",
              formula: "SUM(amount)",
              source_columns: ["amount"],
              counting_unit: "row",
              filters: {},
              limitations: null,
            } as MetricTrace)}
          />
          <KpiCard
            title="روز پرفعال"
            value={
              daily.length > 0
                ? daily.reduce((max, d) => (Number(d.attempts) > Number(max.attempts) ? d : max)).date
                : "---"
            }
            metricId="peak_day_activity"
            onClick={() => setSelectedMetric({
              metric_id: "peak_day_activity",
              label: "روز پرفعال",
              value: daily.length > 0
                ? daily.reduce((max, d) => (Number(d.attempts) > Number(max.attempts) ? d : max)).date
                : "N/A",
              definition: "روز با بیشترین تعداد تلاش‌ها",
              formula: "GROUP BY date → MAX(COUNT(*))",
              source_columns: ["created_at"],
              counting_unit: "row",
              filters: {},
              limitations: null,
            } as MetricTrace)}
          />
        </div>

        <DailyTrendChart data={daily} />
        <AmountTrendChart data={daily} />

        {traceability && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
            <h3 className="text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500" />
              اطلاعات محاسبه
            </h3>
            <p className="text-xs text-slate-400">{traceability.definition}</p>
            <code className="text-xs text-sky-400 block mt-1 bg-slate-900 px-2 py-1 rounded">
              {traceability.formula}
            </code>
            {traceability.limitations && (
              <p className="text-xs text-amber-300 mt-2">{traceability.limitations}</p>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderRankingTab = () => {
    if (loading) return <LoadingCard />;
    if (error) return <ErrorCard error={error} />;
    if (!rankingData) return <EmptyCard />;

    const rankings = rankingData.rankings || [];
    const traceability = rankingData.traceability;

    return (
      <div className="space-y-6">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-400" />
            رتبه‌بندی فروشندگان (بر اساس مبلغ)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-right">
              <thead>
                <tr className="border-b border-slate-700 text-slate-300">
                  <th className="pb-2">رتبه</th>
                  <th className="pb-2">کلید فروشنده</th>
                  <th className="pb-2">مجموع مبلغ (ریال)</th>
                  <th className="pb-2">تلاش‌ها</th>
                  <th className="pb-2">تأیید شده</th>
                  <th className="pb-2">نرخ موفقیت</th>
                </tr>
              </thead>
              <tbody>
                {rankings.slice(0, 50).map((r: any, i: number) => (
                  <tr key={r.merchant_key || i} className="border-b border-slate-800">
                    <td className="py-2">{i + 1}</td>
                    <td className="py-2 text-sky-400">{r.merchant_key}</td>
                    <td className="py-2">{formatCurrency(Number(r.total_amount) || 0)}</td>
                    <td className="py-2">{formatNumber(Number(r.attempt_count) || 0)}</td>
                    <td className="py-2">{formatNumber(Number(r.verified_count) || 0)}</td>
                    <td className="py-2">{Number(r.success_rate) || 0}٪</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {traceability && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
            <h3 className="text-sm font-medium text-slate-300 mb-2">اطلاعات محاسبه</h3>
            <code className="text-xs text-sky-400 block bg-slate-900 px-2 py-1 rounded">
              {traceability.formula}
            </code>
            {traceability.limitations && (
              <p className="text-xs text-amber-300 mt-2">{traceability.limitations}</p>
            )}
          </div>
        )}
      </div>
    );
  };

  function LoadingCard() {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-slate-400">در حال بارگذاری داده‌ها...</div>
      </div>
    );
  }

  function EmptyCard() {
    return (
      <div className="text-center py-12 text-slate-400">
        هیچ داده‌ای برای این فیلترهای انتخابی یافت نشد.
      </div>
    );
  }

  function ErrorCard({ error }: { error: string }) {
    return (
      <div className="bg-red-900/50 border border-red-500 text-red-200 rounded-lg p-4 text-center">
        خطا: {error}
      </div>
    );
  }

  // Main dashboard render (Stage 1)
  function renderOverviewTab() {
    return (
      <>
        {/* KPI Cards */}
        {!loading && overviewData && overviewData.metrics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <KpiCard
              title="تعداد تلاش‌ها"
              value={formatNumber(getMetricValue("payment_attempts") as number)}
              metricId="payment_attempts"
              onClick={() => setSelectedMetric(getSelectedMetric("payment_attempts"))}
            />
            <KpiCard
              title="سشن‌های یکتا"
              value={formatNumber(getMetricValue("unique_sessions") as number)}
              metricId="unique_sessions"
              onClick={() => setSelectedMetric(getSelectedMetric("unique_sessions"))}
            />
            <KpiCard
              title="پرداخت‌های تأیید"
              value={formatNumber(getMetricValue("verified_count") as number)}
              metricId="verified_count"
              onClick={() => setSelectedMetric(getSelectedMetric("verified_count"))}
            />
            <KpiCard
              title="نرخ موفقیت"
              value={(getMetricValue("success_rate") as number) + "٪"}
              metricId="success_rate"
              onClick={() => setSelectedMetric(getSelectedMetric("success_rate"))}
            />
          </div>
        )}

        {/* Total Amount & Avg Amount Cards */}
        {!loading && overviewData && overviewData.metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <KpiCard
              title="مجموع مبلغ (همه ردیف‌ها)"
              value={formatCurrency(getMetricValue("total_amount") as number)}
              metricId="total_amount"
              onClick={() => setSelectedMetric(getSelectedMetric("total_amount"))}
            />
            <KpiCard
              title="متوسط مبلغ"
              value={formatCurrency(getMetricValue("avg_amount") as number)}
              metricId="avg_amount"
              onClick={() => setSelectedMetric(getSelectedMetric("avg_amount"))}
            />
          </div>
        )}

        {/* Charts */}
        {!loading && trendsData && trendsData.daily && trendsData.daily.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <DailyTrendChart data={trendsData.daily} />
            <AmountTrendChart data={trendsData.daily} />
          </div>
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-center mb-2">
          داشبورد تحلیلی زرین‌پال
        </h1>
        <p className="text-slate-400 text-center text-sm">
          فاز 3 — تحلیل کارمزد تعدیلشده
        </p>
      </div>

      {/* Data Limitation Warning */}
      <DataLimitationWarning />

      {/* Navigation Tabs */}
      <div className="mb-6 flex justify-center">
        <div className="inline-flex bg-slate-800 border border-slate-700 rounded-xl p-1">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 text-sm rounded-lg transition-all ${
              activeTab === "overview"
                ? "bg-sky-600 text-white"
                : "text-slate-300 hover:text-slate-100"
            }`}
          >
            نمای کلی (Stage 1)
          </button>
          <button
            onClick={() => setActiveTab("share")}
            className={`px-4 py-2 text-sm rounded-lg transition-all ${
              activeTab === "share"
                ? "bg-emerald-600 text-white"
                : "text-slate-300 hover:text-slate-100"
            }`}
          >
            فروش و درصد (Stage 2)
          </button>
          <button
            onClick={() => setActiveTab("activity")}
            className={`px-4 py-2 text-sm rounded-lg transition-all ${
              activeTab === "activity"
                ? "bg-purple-600 text-white"
                : "text-slate-300 hover:text-slate-100"
            }`}
          >
            فعالیت زمانی (Stage 2)
          </button>
          <button
            onClick={() => setActiveTab("ranking")}
            className={`px-4 py-2 text-sm rounded-lg transition-all ${
              activeTab === "ranking"
                ? "bg-amber-600 text-white"
                : "text-slate-300 hover:text-slate-100"
            }`}
          >
            رتبه‌بندی فروشندگان (Stage 2)
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-center">
        <MerchantSelector
          merchants={merchants}
          selected={selectedMerchant}
          onChange={setSelectedMerchant}
        />
        <DateRangeFilter
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
        />
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-200 rounded-lg p-4 mb-4 text-center">
          خطا: {error}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="text-slate-400">در حال بارگذاری داده‌ها...</div>
        </div>
      )}

      {/* Empty state */}
      {!loading && overviewData && overviewData.metrics &&
        getMetricValue("payment_attempts") === 0 && activeTab === "overview" && (
          <div className="text-center py-12 text-slate-400">
            هیچ داده‌ای برای این فروشنده و بازه زمانی یافت نشد.
          </div>
        )}

      {/* Tab content */}
      {!loading && (
        <>
          {activeTab === "overview" && renderOverviewTab()}
          {activeTab === "share" && renderSalesShareTab()}
          {activeTab === "activity" && renderActivityTab()}
          {activeTab === "ranking" && renderRankingTab()}
        </>
      )}

      {/* Calculation Details Drawer */}
      {selectedMetric && (
        <CalculationDetails
          metric={selectedMetric}
          onClose={() => setSelectedMetric(null)}
        />
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { MerchantSelector } from "@/components/MerchantSelector";
import { DateRangeFilter } from "@/components/DateRangeFilter";
import { KpiCard } from "@/components/KpiCard";
import { DailyTrendChart } from "@/components/DailyTrendChart";
import { AmountTrendChart } from "@/components/AmountTrendChart";
import { CalculationDetails } from "@/components/CalculationDetails";
import { DataLimitationWarning } from "@/components/DataLimitationWarning";
import {
  MerchantInfo,
  MetricTrace,
  OverviewResponse,
  TrendsResponse,
} from "@/types";
import { fetchOverview, fetchMerchants, fetchTrends } from "@/lib/api";

export default function DashboardPage() {
  const [selectedMerchant, setSelectedMerchant] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [merchants, setMerchants] = useState<MerchantInfo[]>([]);
  const [overviewData, setOverviewData] = useState<OverviewResponse | null>(
    null
  );
  const [trendsData, setTrendsData] = useState<TrendsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<MetricTrace | null>(
    null
  );

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

  // Fetch overview and trends when merchant or dates change
  useEffect(() => {
    if (!selectedMerchant) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [overview, trends] = await Promise.all([
          fetchOverview(selectedMerchant, startDate, endDate),
          fetchTrends(selectedMerchant, startDate, endDate),
        ]);
        setOverviewData(overview);
        setTrendsData(trends);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedMerchant, startDate, endDate]);

  const getMetricValue = (metricId: string) => {
    const metric = overviewData?.metrics?.find(
      (m) => m.metric_id === metricId
    );
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

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-center mb-2">
          داشبورد تحلیلی زرین‌پال
        </h1>
        <p className="text-slate-400 text-center text-sm">
          فاز 1 — نمای کلی فروشنده
        </p>
      </div>

      {/* Data Limitation Warning */}
      <DataLimitationWarning />

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
      {!loading &&
        overviewData &&
        overviewData.metrics &&
        getMetricValue("payment_attempts") === 0 && (
          <div className="text-center py-12 text-slate-400">
            هیچ داده‌ای برای این فروشنده و بازه زمانی یافت نشد.
          </div>
        )}

      {/* KPI Cards */}
      {!loading && overviewData && overviewData.metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <KpiCard
            title="تعداد تلاش‌ها"
            value={formatNumber(
              getMetricValue("payment_attempts") as number
            )}
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
            title="مجموع مبلغ"
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

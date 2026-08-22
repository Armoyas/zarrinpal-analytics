"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, BarChart3, ShoppingCart, PieChart, Activity, CreditCard, AlertTriangle, TrendingUp, TrendingDown, Users, Calendar, ExternalLink } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DataLimitationWarning } from "@/components/ui/data-limitation-warning";
import { CalculationDetails, CalculationItem } from "@/components/ui/calculation-details";
import { api } from "@/lib/api";
import { useApi } from "@/lib/api";
import { formatRial } from "@/lib/utils";
import { MerchantOption, OverviewMetrics, DailyTrendPoint } from "@/types";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
  Area,
  AreaChart,
  PieChart as RePieChart,
  Pie,
  Cell,
} from "recharts";

// Tab content component for Stage 1: Core Merchant Overview
function OverviewTab({ merchantKey, startDate, endDate }: { merchantKey: string | null; startDate: string; endDate: string }) {
  return (
    <OverviewTabContent merchantKey={merchantKey} startDate={startDate} endDate={endDate} />
  );
}

// Separate component to use the hook inside
function OverviewTabContent({ merchantKey, startDate, endDate }: { merchantKey: string | null; startDate: string; endDate: string }) {
  const { data: merchantsData, isLoading: merchantsLoading } = useApi(
    ["merchants"],
    () => api.getMerchants()
  );

  const { data: overviewData, isLoading: overviewLoading } = useApi(
    ["overview", merchantKey, startDate, endDate],
    () =>
      api.getOverview({
        merchant_key: merchantKey || undefined,
        start_date: startDate,
        end_date: endDate,
      }),
    { enabled: !!merchantKey }
  );

  const { data: trendsData, isLoading: trendsLoading } = useApi(
    ["trends", merchantKey, startDate, endDate],
    () =>
      api.getDailyTrends({
        merchant_key: merchantKey || undefined,
        start_date: startDate,
        end_date: endDate,
      }),
    { enabled: !!merchantKey }
  );

  const merchants = merchantsData?.merchants || [];
  const metrics = overviewData?.metrics || null;
  const trends = trendsData?.daily_trends || [];

  return (
    <div className="space-y-6">
      {/* Data limitation warning */}
      {!merchantKey && (
        <DataLimitationWarning>
          <p>لطفاً یک فروشگاه انتخاب کنید تا معیارهای خلاصه نمایش داده شوند.</p>
        </DataLimitationWarning>
      )}

      {/* KPI Cards */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            title="تلاش‌های پرداخت"
            value={metrics.attempt_count}
            description="تعداد ردیف‌های پرداخت"
            countingUnit="rows"
            icon={<BarChart3 className="h-4 w-4" />}
          />
          <KpiCard
            title="جلسات یکتا"
            value={metrics.unique_session_count}
            description="شناسه‌های جلسه یکتا"
            countingUnit="sessions"
            icon={<Users className="h-4 w-4" />}
          />
          <KpiCard
            title="پرداخت موفق"
            value={metrics.verified_count}
            description="تراکنش‌های وریفای‌شده"
            countingUnit="verified"
            icon={<TrendingUp className="h-4 w-4" />}
          />
          <KpiCard
            title="نرخ موفقیت"
            value={`${metrics.success_rate.toFixed(1)}%`}
            description="نسبت موفق به کل"
            countingUnit="ratio"
            icon={<PieChart className="h-4 w-4" />}
          />
        </div>
      )}

      {/* Amount Cards */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <KpiCard
            title="کل مبلغ"
            value={formatRial(metrics.amount.total_rials)}
            description="مجموع تمام ردیف‌ها"
            countingUnit="rows"
            icon={<CreditCard className="h-4 w-4" />}
          />
          <KpiCard
            title="متوسط مبلغ"
            value={formatRial(metrics.amount.avg_per_attempt_rials)}
            description="متوسط هزینه هر تلاش"
            countingUnit="rows"
            icon={<BarChart3 className="h-4 w-4" />}
          />
          <KpiCard
            title="شکست‌خورده"
            value={metrics.failed_count}
            description="تلاش‌های ناموفق"
            countingUnit="attempts"
            icon={<TrendingDown className="h-4 w-4" />}
          />
        </div>
      )}

      {/* Daily Activity Chart */}
      {trends.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>روند فعالیت روزانه</CardTitle>
            <CardDescription>تعداد فعالیت‌ها و مبلغ در هر روز</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trends}>
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="insideLeft" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="daily_count" stroke="#3b82f6" name="تعداد" />
                <Line yAxisId="right" type="monotone" dataKey="daily_amount" stroke="#10b981" name="مبلغ (ریال)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Calculation Details */}
      {metrics && (
        <CalculationDetails
          items={[
            {
              label: "تلاش‌های پرداخت",
              formula: "COUNT(*)",
              countingUnit: "rows",
              sourceColumns: ["session_key", "try_seq", "created_at"],
              result: metrics.attempt_count.toString(),
            },
            {
              label: "جلسات یکتا",
              formula: "COUNT(DISTINCT session_key)",
              countingUnit: "sessions",
              sourceColumns: ["session_key"],
              result: metrics.unique_session_count.toString(),
            },
            {
              label: "نرخ موفقیت",
              formula: "(verified_count / attempt_count) × 100",
              countingUnit: "ratio",
              sourceColumns: ["session_status"],
              result: `${metrics.success_rate.toFixed(2)}%`,
            },
            {
              label: "کل مبلغ",
              formula: "SUM(amount)",
              countingUnit: "rows",
              sourceColumns: ["amount"],
              result: formatRial(metrics.amount.total_rials),
            },
          ]}
        />
      )}
    </div>
  );
}

// KPI Card component
function KpiCard({ title, value, description, countingUnit, icon }: {
  title: string;
  value: string | number;
  description: string;
  countingUnit: string;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        <Badge variant="outline" className="text-xs mt-1">
          واحد: {countingUnit}
        </Badge>
      </CardContent>
    </Card>
  );
}

// Stage 2: Sales Share Tab
function SalesShareTab({ merchantKey, startDate, endDate }: { merchantKey: string | null; startDate: string; endDate: string }) {
  const { data: shareData, isLoading } = useApi(
    ["sales-share", merchantKey, startDate, endDate],
    () =>
      api.getSalesShare({
        merchant_key: merchantKey || undefined,
        start_date: startDate,
        end_date: endDate,
      }),
    { enabled: !!merchantKey }
  );

  const share = shareData?.sales_share || [];

  return (
    <div className="space-y-6">
      <DataLimitationWarning>
        <p>
          این تحلیل بر اساس تعریف "مبلغ موفق" (session_status در
          'Verified', 'Paid', 'Reversed') محاسبه شده است. مبلغ کل تلاش‌ها
          (Stage 1) نیز در اینجا در دسترس است.
        </p>
      </DataLimitationWarning>

      {share.length > 0 && (
        <>
          {/* Merchant Sales Share */}
          <Card>
            <CardHeader>
              <CardTitle>سهم فروش فروشگاه‌ها</CardTitle>
              <CardDescription>سهم مبلغ موفق هر فروشگاه از کل</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={share.filter(s => s.breakdown_type === "merchant").slice(0, 10)}>
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="share_percentage" fill="#3b82f6" name="سهم (%)" />
                  <Bar dataKey="successful_amount" fill="#10b981" name="مبلغ موفق (ریال)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Category Sales Share */}
          <Card>
            <CardHeader>
              <CardTitle>سهم فروش دسته‌بندی‌ها</CardTitle>
              <CardDescription>سهم هر دسته‌بندی از کل فروش موفق</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RePieChart>
                  <Pie
                    data={share.filter(s => s.breakdown_type === "category")}
                    dataKey="share_percentage"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                  >
                    {share.filter(s => s.breakdown_type === "category").map((_, i) => (
                      <Cell key={`cell-${i}`} fill={["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"][i % 5]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RePieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Calculation Details */}
          <CalculationDetails
            items={[
              {
                label: "مرچانت سهم فروش",
                formula: "merchant successful_amount / total successful_amount × 100",
                countingUnit: "successful_amount",
                sourceColumns: ["merchant_key", "amount", "session_status"],
                result: "نمایش در جدول زیر",
              },
            ]}
          />
        </>
      )}

      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-96 w-full" />
        </div>
      )}

      {!isLoading && (!share || share.length === 0) && merchantKey && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>داده‌ای یافت نشد</AlertTitle>
          <AlertDescription>
            هیچ داده‌ای برای فروشگاه و بازه زمانی انتخاب‌شده یافت نشد.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

// Stage 2: Activity Analysis Tab
function ActivityTab({ merchantKey, startDate, endDate }: { merchantKey: string | null; startDate: string; endDate: string }) {
  const { data: dailyData, isLoading: dailyLoading } = useApi(
    ["activity-daily", merchantKey, startDate, endDate],
    () =>
      api.getActivityDaily({
        merchant_key: merchantKey || undefined,
        start_date: startDate,
        end_date: endDate,
      }),
    { enabled: !!merchantKey }
  );

  const { data: monthlyData, isLoading: monthlyLoading } = useApi(
    ["activity-monthly", merchantKey, startDate, endDate],
    () =>
      api.getActivityMonthly({
        merchant_key: merchantKey || undefined,
        start_date: startDate,
        end_date: endDate,
      }),
    { enabled: !!merchantKey }
  );

  const { data: yearlyData, isLoading: yearlyLoading } = useApi(
    ["activity-yearly", merchantKey, startDate, endDate],
    () =>
      api.getActivityYearly({
        merchant_key: merchantKey || undefined,
        start_date: startDate,
        end_date: endDate,
      }),
    { enabled: !!merchantKey }
  );

  const { data: rankingData, isLoading: rankingLoading } = useApi(
    ["merchant-ranking", startDate, endDate],
    () =>
      api.getMerchantsRanking({
        start_date: startDate,
        end_date: endDate,
      }),
    { enabled: !!merchantKey }
  );

  const { data: peakDayData, isLoading: peakDayLoading } = useApi(
    ["peak-day", startDate, endDate],
    () =>
      api.getHighestActivityDay({
        merchant_key: merchantKey || undefined,
        start_date: startDate,
        end_date: endDate,
      }),
    { enabled: !!merchantKey }
  );

  const daily = dailyData?.daily_activity || [];
  const monthly = monthlyData?.monthly_activity || [];
  const yearly = yearlyData?.yearly_activity || [];
  const ranking = rankingData?.merchant_ranking || [];
  const peakDay = peakDayData?.peak_day || null;

  return (
    <div className="space-y-6">
      <DataLimitationWarning>
        <p>روزانه، ماهانه، و سالانه بر اساس روزهایی که داده وجود دارد، محاسبه شده است. ماه‌های یا سال‌های بدون فعالیت در نمودار نمایش داده نمی‌شوند.</p>
      </DataLimitationWarning>

      {/* Monthly Amount Trend */}
      {monthly.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>روند ماهانه مبلغ</CardTitle>
            <CardDescription>مجموع مبلغ موفق در هر ماه</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthly}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="successful_amount" fill="#10b981" stroke="#10b981" name="مبلغ موفق (ریال)" />
                <Area type="monotone" dataKey="total_attempted_amount" fill="#3b82f6" stroke="#3b82f6" name="مبلغ کل تلاش‌ها (ریال)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Yearly Trend */}
      {yearly.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>روند سالانه فعالیت</CardTitle>
            <CardDescription>تعداد تلاش‌ها و مبلغ موفق در هر سال</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={yearly}>
                <XAxis dataKey="year" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="insideLeft" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="payment_count" stroke="#3b82f6" name="تعداد تلاش‌ها" />
                <Line yAxisId="right" type="monotone" dataKey="successful_amount" stroke="#10b981" name="مبلغ موفق (ریال)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Merchant Ranking */}
      {ranking.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>رتبه فروشگاه‌ها</CardTitle>
            <CardDescription>برترین فروشگاه‌ها بر اساس مبلغ موفق</CardDescription>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-right py-2">رتبه</th>
                  <th className="text-right py-2">فروشگاه</th>
                  <th className="text-right py-2">مبلغ موفق (ریال)</th>
                  <th className="text-right py-2">تعداد تلاش‌ها</th>
                  <th className="text-right py-2">سهم (%)</th>
                </tr>
              </thead>
              <tbody>
                {ranking.slice(0, 10).map((m, i) => (
                  <tr key={m.merchant_key} className="border-t">
                    <td className="py-2 text-center">{i + 1}</td>
                    <td className="py-2">{m.merchant_key}</td>
                    <td className="py-2">{formatRial(m.successful_amount || m.total_amount)}</td>
                    <td className="py-2 text-center">{m.payment_count}</td>
                    <td className="py-2 text-center">{m.share_percentage.toFixed(2)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Peak Day */}
      {peakDay && (
        <Card>
          <CardHeader>
            <CardTitle>روز پرفعالیت</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg">
              {peakDay.day} با {peakDay.payment_count} تلاش پرداخت
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Stage 3: Adjusted-Fee Analysis Tab
function AdjustedFeeTab({ merchantKey, startDate, endDate }: { merchantKey: string | null; startDate: string; endDate: string }) {
  const { data: feeData, isLoading } = useApi(
    ["adjusted-fee", merchantKey, startDate, endDate],
    () =>
      api.getAdjustedFeeMetrics({
        merchant_key: merchantKey || undefined,
        start_date: startDate,
        end_date: endDate,
      }),
    { enabled: !!merchantKey }
  );

  const { data: feeTrendData, isLoading: trendLoading } = useApi(
    ["adjusted-fee-trend", merchantKey, startDate, endDate],
    () =>
      api.getAdjustedFeeTrend({
        merchant_key: merchantKey || undefined,
        start_date: startDate,
        end_date: endDate,
      }),
    { enabled: !!merchantKey }
  );

  const { data: feeMerchantsData, isLoading: merchantsLoading } = useApi(
    ["adjusted-fee-merchants", startDate, endDate],
    () =>
      api.getAdjustedFeeByMerchant({
        start_date: startDate,
        end_date: endDate,
      }),
    { enabled: !!merchantKey }
  );

  const { data: feeCategoriesData, isLoading: categoriesLoading } = useApi(
    ["adjusted-fee-categories", startDate, endDate],
    () =>
      api.getAdjustedFeeByCategory({
        start_date: startDate,
        end_date: endDate,
      }),
    { enabled: !!merchantKey }
  );

  const metrics = feeData?.adjusted_fee_metrics || null;
  const trend = feeTrendData?.fee_trend || [];
  const feeMerchants = feeMerchantsData?.fee_by_merchant || [];
  const feeCategories = feeCategoriesData?.fee_by_category || [];

  return (
    <div className="space-y-6">
      {/* Critical Warning */}
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>⚠️ شاخص کارمزد تعدیل‌شده برای مقایسه نسبی</AlertTitle>
        <AlertDescription>
          <p className="mb-2">
            <strong>اهمیتی ندارد که این یک هشدار است:</strong>
          </p>
          <p className="mb-2">
            ستون <code>adjusted_fee</code> هزینه واقعی زرین‌پال را نشان نمی‌دهد. این یک شاخص
            کارمزد تعدیل‌شده برای مقایسه نسبی است که با استفاده از یک ضریب ثابت ساخته شده است.
          </p>
          <ul className="list-disc list-inside text-sm space-y-1">
            <li>هرگز این را به عنوان کارمزد واقعی یا کمیسیون واقعی ارائه نکنید.</li>
            <li>مقایسه‌های نسبی داخل یک دیتاست ممکن است معتبر باشند.</li>
            <li>استفاده از این مقادیر برای صورتحساب یا محاسبه‌ی واقعی مناسب نیست.</li>
          </ul>
        </AlertDescription>
      </Alert>

      {/* Fee Metrics Cards */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <KpiCard
            title="کل شاخص کارمزد"
            value={formatRial(metrics.total_fee_indicator || 0)}
            description="Confidentiality-adjusted fee indicator (NOT real fee)"
            countingUnit="rows"
            icon={<CreditCard className="h-4 w-4" />}
          />
          <KpiCard
            title="متوسط شاخص کارمزد"
            value={formatRial(metrics.avg_fee_indicator || 0)}
            description="Confidentiality-adjusted fee indicator (NOT real fee)"
            countingUnit="rows"
            icon={<BarChart3 className="h-4 w-4" />}
          />
          <KpiCard
            title="سهم کارمزد از مبلغ"
            value={`${metrics.fee_share_of_amount.toFixed(2)}%`}
            description="sum(adjusted_fee) / sum(amount) × 100"
            countingUnit="ratio"
            icon={<PieChart className="h-4 w-4" />}
          />
        </div>
      )}

      {/* Fee Trend */}
      {trend.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>روند شاخص کارمزد</CardTitle>
            <CardDescription>
              <span className="text-red-600 font-medium">
                ⚠️ شاخص کارمزد تعدیل‌شده برای مقایسه نسبی — نه کارمزد واقعی
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trend}>
                <XAxis dataKey="period" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="insideLeft" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="total_fee" stroke="#ef4444" name="کل شاخص (ریال)" />
                <Line yAxisId="right" type="monotone" dataKey="fee_share_percentage" stroke="#f59e0b" name="سهم (%)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Fee by Merchant */}
      {feeMerchants.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>شاخص کارمزد توسط فروشگاه</CardTitle>
            <Badge variant="destructive" className="mt-2">
              نه کارمزد واقعی
            </Badge>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-right py-2">فروشگاه</th>
                  <th className="text-right py-2">کل شاخص (ریال)</th>
                  <th className="text-right py-2">متوسط (ریال)</th>
                  <th className="text-right py-2">سهم (%)</th>
                </tr>
              </thead>
              <tbody>
                {feeMerchants.map((m) => (
                  <tr key={m.merchant_key} className="border-t">
                    <td className="py-2">{m.merchant_key}</td>
                    <td className="py-2">{formatRial(m.total_fee_indicator || 0)}</td>
                    <td className="py-2">{formatRial(m.avg_fee_indicator || 0)}</td>
                    <td className="py-2 text-center">{(m.fee_share_of_amount || 0).toFixed(2)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Fee by Category */}
      {feeCategories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>شاخص کارمزد توسط دسته‌بندی</CardTitle>
            <Badge variant="destructive" className="mt-2">
              نه کارمزد واقعی
        </Badge>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-right py-2">دسته‌بندی</th>
                  <th className="text-right py-2">کل شاخص (ریال)</th>
                  <th className="text-right py-2">متوسط (ریال)</th>
                  <th className="text-right py-2">سهم (%)</th>
                </tr>
              </thead>
              <tbody>
                {feeCategories.map((c) => (
                  <tr key={c.category_title} className="border-t">
                    <td className="py-2">{c.category_title}</td>
                    <td className="py-2">{formatRial(c.total_fee_indicator || 0)}</td>
                    <td className="py-2">{formatRial(c.avg_fee_indicator || 0)}</td>
                    <td className="py-2 text-center">{(c.fee_share_of_amount || 0).toFixed(2)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Calculation Details with fee warning */}
      {metrics && (
        <CalculationDetails
          items={[
            {
              label: "کل شاخص کارمزد",
              formula: "SUM(adjusted_fee)",
              countingUnit: "rows",
              sourceColumns: ["adjusted_fee"],
              result: formatRial(metrics.total_fee_indicator || 0),
              warning: "این مقدار یک شاخص کارمزد تعدیل‌شده است، نه کارمزد واقعی زرین‌پال",
            },
          ]}
        />
      )}
    </div>
  );
}

// Main Dashboard Page
export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "sales-share" | "activity" | "adjusted-fee">("overview");
  const [selectedMerchant, setSelectedMerchant] = useState<string | null>(null);
  const [startDate, setStartDate] = useState("2024-01-01");
  const [endDate, setEndDate] = useState("2024-12-30");
  const [showCalculationDetails, setShowCalculationDetails] = useState(false);

  // Fetch merchants for selector
  const { data: merchantsData, isLoading: merchantsLoading } = useApi(
    ["merchants"],
    () => api.getMerchants()
  );

  const merchants: MerchantOption[] = merchantsData?.merchants || [];

  const tabs = [
    { id: "overview", label: "خلاصه", icon: <BarChart3 className="h-4 w-4" /> },
    { id: "sales-share", label: "سهم فروش", icon: <PieChart className="h-4 w-4" /> },
    { id: "activity", label: "فعالیت زمانی", icon: <Activity className="h-4 w-4" /> },
    { id: "adjusted-fee", label: "کارمزد (شاخص)", icon: <CreditCard className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">داشبورد تجزیه و تحلیل زرین‌پال</h1>
          <p className="text-sm text-muted-foreground mt-1">
            تجزیه و تحلیل فعالیت، فروش، و عملکرد فروشگاه‌ها
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Merchant Selector & Date Range */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <Select value={selectedMerchant || ""} onValueChange={setSelectedMerchant}>
            <SelectTrigger className="w-full md:w-64">
              <SelectValue placeholder="انتخاب فروشگاه" />
            </SelectTrigger>
            <SelectContent>
              {merchantsLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                merchants.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    <div className="flex justify-between">
                      <span>{m.value}</span>
                      <span className="text-muted-foreground text-sm">
                        ({m.label})
                      </span>
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
            />
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b mb-6">
          <nav className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <OverviewTab merchantKey={selectedMerchant} startDate={startDate} endDate={endDate} />
        )}
        {activeTab === "sales-share" && (
          <SalesShareTab merchantKey={selectedMerchant} startDate={startDate} endDate={endDate} />
        )}
        {activeTab === "activity" && (
          <ActivityTab merchantKey={selectedMerchant} startDate={startDate} endDate={endDate} />
        )}
        {activeTab === "adjusted-fee" && (
          <AdjustedFeeTab merchantKey={selectedMerchant} startDate={startDate} endDate={endDate} />
        )}
      </main>
    </div>
  );
}

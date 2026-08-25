"use client"

export const dynamic = "force-dynamic"

import { useParams, useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
  TableHead,
} from "@/components/ui/table"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Area, AreaChart, PieChart, Pie, Cell,
} from "recharts"
import {
  ArrowRight, ShoppingCart, DollarSign, Users, TrendingUp,
  TrendingDown, AlertCircle, CheckCircle2, Banknote,
} from "lucide-react"
import { toPersianNumber, formatCurrencyIRToman, formatPercentValue } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"

const STATUS_COLORS: Record<string, string> = {
  Verified: "text-green-400 bg-green-500/10",
  Paid: "text-blue-400 bg-blue-500/10",
  InBank: "text-yellow-400 bg-yellow-500/10",
  Failed: "text-red-400 bg-red-500/10",
  Reversed: "text-orange-400 bg-orange-500/10",
  NoAttempt: "text-gray-400 bg-gray-500/10",
}

const PIE_COLORS = ["hsl(38 100% 45%)", "hsl(220 70% 50%)", "hsl(150 70% 50%)", "hsl(30 70% 50%)", "hsl(0 70% 60%)"]

export default function MerchantDetailPage() {
  const params = useParams()
  const router = useRouter()
  const merchantKey = params.key as string

  const { data: merchant, isLoading } = useQuery({
    queryKey: ["merchant-detail", merchantKey],
    queryFn: () => api.getMerchantDetail(merchantKey),
    staleTime: 1000 * 60 * 5,
    enabled: !!merchantKey,
  })

  if (!merchantKey) {
    return <div>کلید فروشگاه یافت نشد</div>
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 px-4">
        <Skeleton className="h-8 w-64 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
        <Skeleton className="h-64 w-full mb-6" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  if (!merchant) {
    return (
      <div className="container mx-auto py-6 px-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground py-8">
              فروشگاه یافت نشد
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Build status breakdown chart data
  const statusData = (merchant.status_breakdown || []).map((s: any) => ({
    name: s.session_status || "Unknown",
    value: s.cnt || 0,
  }))

  // Build daily trend chart data
  const trendData = (merchant.daily_trend || []).map((d: any) => ({
    date: d.day,
    attempts: d.count || 0,
    amount: d.amount || 0,
    success_rate: d.success_rate || 0,
  }))

  // Peer comparison values
  const peer = merchant.peer_comparison || {}
  const mySuccessRate = merchant.success_rate || 0
  const peerSuccessRate = peer.peer_success_rate || 0
  const rateDiff = mySuccessRate - peerSuccessRate

  return (
    <div className="container mx-auto py-6 space-y-8 px-4 md:px-6">
      {/* Header with back button */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="flex items-center gap-1"
        >
          <ArrowRight className="h-4 w-4" />
          بازگشت
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            جزئیات فروشگاه
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <code className="text-sm bg-muted px-2 py-1 rounded font-mono">
              {merchant.merchant_key}
            </code>
            <Badge variant="secondary">{merchant.category_title}</Badge>
          </div>
        </div>
      </div>

      <Separator />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              تلاش‌های پرداختی
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {toPersianNumber(merchant.total_attempts.toLocaleString())}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {toPersianNumber(merchant.unique_sessions.toLocaleString())} سشن یکتا
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              مبلغ کل
            </CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatCurrencyIRToman(merchant.total_amount)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              میانگین: {formatCurrencyIRToman(merchant.avg_amount)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              نرخ موفقیت
            </CardTitle>
            {mySuccessRate >= 70 ? (
              <TrendingUp className="h-4 w-4 text-green-400" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-400" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatPercentValue(mySuccessRate)}
            </div>
            <p className={`text-xs mt-1 ${rateDiff >= 0 ? "text-green-500" : "text-red-500"}`}>
              {rateDiff >= 0 ? "+" : ""}
              {formatPercentValue(rateDiff)} نسبت به هم‌دسته
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              رتبه در دسته
            </CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {toPersianNumber(merchant.merchant_rank || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              از {toPersianNumber(merchant.total_merchants_in_category || 0)} فروشگاه
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Status Breakdown + Amount Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Status Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>توزیع وضعیت‌ها</CardTitle>
            <CardDescription>
              توزیع سشن‌ها بر اساس وضعیت نهایی
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {statusData.map((_, i) => (
                      <Cell key={`cell-${i}`} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Status Breakdown Table */}
        <Card>
          <CardHeader>
            <CardTitle>جزئیات وضعیت‌ها</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">وضعیت</TableHead>
                  <TableHead className="text-right">تعداد</TableHead>
                  <TableHead className="text-right">مبلغ (ریال)</TableHead>
                  <TableHead className="text-right">سهم</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {merchant.status_breakdown.map((s: any, i: number) => {
                  const status = s.session_status || "Unknown"
                  const amount = s.amt || 0
                  const share = merchant.total_amount > 0
                    ? ((amount / merchant.total_amount) * 100).toFixed(1)
                    : "0.0"
                  return (
                    <TableRow key={i}>
                      <TableCell>
                        <Badge className={STATUS_COLORS[status] || "text-muted bg-muted/20"}>
                          {status}
                        </Badge>
                      </TableCell>
                      <TableCell>{toPersianNumber(s.cnt || 0)}</TableCell>
                      <TableCell>{toPersianNumber((amount || 0).toLocaleString())}</TableCell>
                      <TableCell>{toPersianNumber(share)}%</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Daily Trend Chart + Adjusted Fee */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Daily Trend Line Chart */}
        <Card>
          <CardHeader>
            <CardTitle>روند روزانه (۳۰ روز اخیر)</CardTitle>
            <CardDescription>
              تلاش‌ها و مبلغ در طول زمان
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="amountGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(38 100% 45%)" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="hsl(38 100% 45%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                    formatter={(value: number, name: string) => {
                      if (name === "attempts") return [toPersianNumber(value), "تلاش"]
                      if (name === "amount") return [formatCurrencyIRToman(value), "مبلغ"]
                      return [value, name]
                    }}
                    labelFormatter={(label: string) => `تاریخ: ${label}`}
                  />
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="attempts"
                    stroke="hsl(220 70% 50%)"
                    fill="hsl(220 70% 50%)"
                    fillOpacity={0.1}
                    strokeWidth={2}
                    name="attempts"
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="amount"
                    stroke="hsl(38 100% 45%)"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    name="amount"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Adjusted Fee Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>کارمزد تنظیم‌شده</CardTitle>
            <CardDescription>
              شاخص کارمزد تعدیل‌شده برای مقایسه نسبی
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground">کل کارمزد</p>
                <p className="text-xl font-bold text-primary">
                  {toPersianNumber((merchant.total_adjusted_fee || 0).toLocaleString())} ریال
                </p>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground">سهم از مبلغ</p>
                <p className="text-xl font-bold text-primary">
                  {formatPercentValue(merchant.adjusted_fee_share || 0)}
                </p>
              </div>
            </div>
            <div className="space-y-2 pt-2">
              <p className="text-xs text-muted-foreground">
                ⚠️ adjusted_fee با ضریب ثابت تنظیم شده — فقط برای مقایسه نسبی معتبر است.
                کارمزد واقعی زرین‌پال نمایش داده نمی‌شود.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Peer Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>مقایسه با هم‌دسته‌ها</CardTitle>
          <CardDescription>
            مقایسه فروشگاه شما با سایر فروشگاه‌های همان دسته
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">نرخ موفقیت شما</p>
              <p className="text-2xl font-bold text-primary">
                {formatPercentValue(mySuccessRate)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                میانگین هم‌دسته: {formatPercentValue(peer.peer_success_rate || 0)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">میانگین مبلغ شما</p>
              <p className="text-2xl font-bold text-primary">
                {formatCurrencyIRToman(merchant.avg_amount)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                میانگین هم‌دسته: {formatCurrencyIRToman(peer.peer_avg_amount || 0)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">کل فروش شما</p>
              <p className="text-2xl font-bold text-primary">
                {formatCurrencyIRToman(merchant.total_amount)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                کل هم‌دسته: {formatCurrencyIRToman(peer.peer_total_amount || 0)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calculation Traceability */}
      {merchant.how_calculated && (
        <Card>
          <CardHeader>
            <CardTitle>چگونه محاسبه شد؟</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              {Object.entries(merchant.how_calculated).map(([key, value]) => (
                <div key={key} className="flex justify-between py-1 border-b last:border-0">
                  <code className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground" dir="ltr">
                    {key}
                  </code>
                  <span className="text-xs text-muted-foreground">{value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

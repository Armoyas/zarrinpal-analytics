"use client"

import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { TrendingUp } from "lucide-react"
import { toPersianNumber } from "@/lib/utils"

interface TransactionTrendsProps {
  data?: any
  maxDays?: number
}

export function TransactionTrends({ data: propData, maxDays = 180 }: TransactionTrendsProps) {
  const { data: countData, isLoading } = useQuery({
    queryKey: ["time-series-trends", "count"],
    queryFn: () => api.getTimeSeries("attempts", "day"),
    staleTime: 1000 * 60 * 5,
  })

  const { data: amountData } = useQuery({
    queryKey: ["time-series-trends", "amount"],
    queryFn: () => api.getTimeSeries("amount", "day"),
    staleTime: 1000 * 60 * 5,
  })

  // Use prop data if provided (from parent prefetching), otherwise use own query
  const timeSeriesData = propData ? propData : countData
  const amountSeries = propData && propData.amount ? propData.amount : amountData

  const isLoadingData = !propData && isLoading

  if (isLoadingData) {
    return <Skeleton className="h-80 w-full" />
  }

  // Normalize backend TimeSeriesPoint[] ({ time_period, value }) to chart format
  const getChartData = () => {
    if (!timeSeriesData) return []

    let countPoints: any[] = []
    let amountPoints: any[] = []

    if (Array.isArray(timeSeriesData)) {
      countPoints = timeSeriesData.map((item: any) => ({
        date: item.date || item.time_period,
        count: item.count || item.total_transactions || item.value || 0,
        amount: item.amount || 0,
      }))
    } else if (timeSeriesData.count) {
      countPoints = (timeSeriesData.count as any[]).map((item: any) => ({
        date: item.date || item.time_period,
        count: item.count || item.value || 0,
        amount: 0,
      }))
      if (timeSeriesData.amount) {
        amountPoints = (timeSeriesData.amount as any[]).map((item: any) => ({
          date: item.date || item.time_period,
          count: 0,
          amount: item.value || 0,
        }))
      }
    }

    if (amountSeries && Array.isArray(amountSeries)) {
      amountPoints = amountSeries.map((item: any) => ({
        date: item.date || item.time_period,
        count: 0,
        amount: item.value || item.amount || 0,
      }))
    }

    // Merge count and amount by date
    const amountMap = new Map(amountPoints.map(p => [p.date, p.amount]))
    const merged = countPoints.map(cp => ({
      date: cp.date,
      count: cp.count,
      amount: amountMap.get(cp.date) || cp.amount || 0,
    }))

    // Sort by date and take last maxDays entries
    return merged
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-maxDays)
  }

  const chartData = getChartData()

  if (!chartData || chartData.length === 0) {
    return <p className="text-center text-muted-foreground py-8">هیچ داده‌ای موجود نیست</p>
  }

  const formatYAxis = (value: number) => {
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`
    return Math.round(value).toString()
  }

  const formatAmount = (value: number) => {
    const toman = value / 100000
    if (toman >= 1000000) return `${(toman / 1000000).toFixed(1)}M تومان`
    if (toman >= 1000) return `${(toman / 1000).toFixed(1)}K تومان`
    return `${Math.round(toman).toLocaleString()} تومان`
  }

  const maxDaysDisplay = chartData.length
  const totalAmount = chartData.reduce((sum, d) => sum + d.amount, 0)
  const totalAttempts = chartData.reduce((sum, d) => sum + d.count, 0)

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>روند تراکنش‌ها</CardTitle>
            <CardDescription>
              تعداد و مبلغ تراکنش‌ها در {toPersianNumber(maxDaysDisplay)} روز اخیر
              — مجموع: {toPersianNumber(totalAttempts)} تلاش، {formatAmount(totalAmount)}
            </CardDescription>
          </div>
          <TrendingUp className="h-5 w-5 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis
                yAxisId="amount"
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                tickFormatter={formatYAxis}
                label={{ value: 'مبلغ', angle: -90, position: 'insideTopLeft' }}
              />
              <YAxis
                yAxisId="transactions"
                orientation="right"
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                tickFormatter={formatYAxis}
                label={{ value: 'تعداد', angle: 90, position: 'insideTopRight' }}
              />
              <Tooltip
                contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
                formatter={(value: number, name: string) => {
                  if (name === 'count') return [toPersianNumber(value), 'تعداد تراکنش']
                  return [formatAmount(value), 'مبلغ (ریال)']
                }}
                labelFormatter={(label) => `تاریخ: ${label}`}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="hsl(38 100% 45%)"
                strokeWidth={2}
                dot={{ r: 3 }}
                yAxisId="transactions"
                name="count"
              />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="hsl(220 70% 50%)"
                strokeDasharray="5 5"
                strokeWidth={2}
                dot={{ r: 3 }}
                yAxisId="amount"
                name="amount"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

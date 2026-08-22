"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { toPersianNumber, formatCurrencyIRToman } from "@/lib/utils"
import { TrendingUp, DollarSign, ShoppingCart, Scale, Users } from "lucide-react"

interface MetricCardProps {
  title: string
  value: string
  change: string
  icon: React.ReactNode
  trend: "up" | "down" | "neutral"
}

function MetricCard({ title, value, change, icon, trend }: MetricCardProps) {
  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        <p
          className={cn(
            "text-xs text-muted-foreground mt-1",
            trend === "up"
              ? "text-green-500"
              : trend === "down"
              ? "text-red-500"
              : ""
          )}
        >
          {change}
        </p>
      </CardContent>
    </Card>
  )
}

export function PerformanceMetrics({ data }: { data?: any }) {
  if (!data) return null

  // Support both real API format and legacy mock format
  const totalTransactions = data.total_attempts || data.total_transactions || 0
  const totalAmount = data.amount?.total_rials || data.total_amount || 0
  const successRate = data.success_rate || 0
  const totalFees = data.adjusted_fee_total || data.total_fees || 0
  const uniqueSessions = data.unique_sessions || 0
  const failureRate = data.failure_rate || 0
  const avgAmount = data.amount?.avg_per_attempt_rials || data.avg_amount || 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <MetricCard
        title="کل تلاش‌های پرداختی"
        value={toPersianNumber(totalTransactions.toLocaleString())}
        change={`نرخ موفقیت: ${toPersianNumber(successRate.toFixed(1))}%`}
        icon={<ShoppingCart className="h-4 w-4 text-primary" />}
        trend={successRate > 50 ? "up" : "down"}
      />
      <MetricCard
        title="مبلغ کل معاملات"
        value={formatCurrencyIRToman(totalAmount)}
        change={`میانگین: ${formatCurrencyIRToman(avgAmount)}`}
        icon={<DollarSign className="h-4 w-4 text-primary" />}
        trend="up"
      />
      <MetricCard
        title="نرخ موفقیت"
        value={`${toPersianNumber(successRate.toFixed(1))}%`}
        change={`شکست: ${toPersianNumber(failureRate.toFixed(1))}%`}
        icon={<TrendingUp className="h-4 w-4 text-green-400" />}
        trend={successRate > 50 ? "up" : "down"}
      />
      <MetricCard
        title="سشن یکتا"
        value={toPersianNumber(uniqueSessions.toLocaleString())}
        change={`${totalTransactions - uniqueSessions} تلاش تکراری`}
        icon={<Users className="h-4 w-4 text-primary" />}
        trend="neutral"
      />
      <MetricCard
        title="کارمزد تنظیم‌شده"
        value={formatCurrencyIRToman(totalFees)}
        change="نماد نسبی، نه کارمزد واقعی"
        icon={<Scale className="h-4 w-4 text-primary" />}
        trend="neutral"
      />
    </div>
  )
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { ArrowUpRight, TrendingUp, DollarSign, ShoppingCart } from "lucide-react"

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
        <p className={cn(
          "text-xs text-muted-foreground mt-1",
          trend === "up" ? "text-green-500" : trend === "down" ? "text-red-500" : ""
        )}>
          {change}
        </p>
      </CardContent>
    </Card>
  )
}

export function PerformanceMetrics({ data }: { data: any }) {
  const formatCurrency = (amount: number) => {
    const num = amount / 100000 // Convert from Rial to Toman
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M تومان`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K تومان`
    return `${num.toLocaleString()} تومان`
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        title="کل معاملات"
        value={data.total_transactions.toLocaleString()}
        change="+12.5% نسبت به ماه قبل"
        icon={<ShoppingCart className="h-4 w-4 text-primary" />}
        trend="up"
      />
      <MetricCard
        title="ارزش کل تراکنش‌ها"
        value={formatCurrency(data.total_amount)}
        change="+8.2% نسبت به ماه قبل"
        icon={<DollarSign className="h-4 w-4 text-primary" />}
        trend="up"
      />
      <MetricCard
        title="نرخ موفقیت"
        value={`${data.success_rate.toFixed(1)}%`}
        change="+3.1% نسبت به ماه قبل"
        icon={<TrendingUp className="h-4 w-4 text-primary" />}
        trend="up"
      />
      <MetricCard
        title="کارمزد کل"
        value={formatCurrency(data.total_fees)}
        change="-2.3% نسبت به ماه قبل"
        icon={<ArrowUpRight className="h-4 w-4 text-primary" />}
        trend="down"
      />
    </div>
  )
}

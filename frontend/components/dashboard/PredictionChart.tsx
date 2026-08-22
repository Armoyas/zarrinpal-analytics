"use client"

import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts"

export function PredictionChart() {
  const { data: predictions, isLoading } = useQuery({
    queryKey: ["ai-predictions"],
    queryFn: api.getAIPredictions,
  })

  if (isLoading) {
    return <Skeleton className="h-[300px] w-full" />
  }

  if (!predictions || predictions.length === 0) {
    return <p className="text-center text-muted-foreground py-8">هیچ داده‌ای موجود نیست</p>
  }

  const chartData = predictions.map((p) => ({
    date: p.date,
    predicted: p.predicted_transactions,
    upper: p.upper_bound,
    lower: p.lower_bound,
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={chartData}>
        <defs>
          <linearGradient id="predictionGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(38 100% 45%)" stopOpacity={0.8} />
            <stop offset="95%" stopColor="hsl(38 100% 45%)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="date"
          tick={{ fontSize: 10, fill: "hsl(0 0% 65%)" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis hide />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(220 20% 12%)",
            border: "1px solid hsl(220 30% 20%)",
            borderRadius: "8px",
          }}
<<<<<<< HEAD
          formatter={(value) => [value.toLocaleString("fa"), "تراکنش‌ها"]}
=======
          formatter={(value: any) => [value.toLocaleString("fa"), "تراکنش‌ها"]}
>>>>>>> b02ecabe7ff1feb08af1199006c2ee9cdf441a41
          labelFormatter={(label) => `تاریخ: ${label}`}
        />
        <Area
          type="monotone"
          dataKey="predicted"
          stroke="hsl(38 100% 45%)"
          fill="url(#predictionGradient)"
          strokeWidth={2}
        />
        <Line
          type="monotone"
          dataKey="upper"
          stroke="hsl(38 100% 45%)"
          strokeDasharray="4 4"
          strokeWidth={1}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="lower"
          stroke="hsl(38 100% 45%)"
          strokeDasharray="4 4"
          strokeWidth={1}
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

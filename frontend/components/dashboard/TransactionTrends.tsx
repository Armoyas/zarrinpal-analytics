"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { TrendingUp } from "lucide-react"

export function TransactionTrends({ data }: { data?: any }) {
  if (!data) return null
  const chartData = data.map((item: any) => ({
    date: new Date(item.date).toLocaleDateString("fa-IR"),
    transactions: item.count,
    amount: Math.round(item.amount / 100000), // Convert to Toman (K)
  }))

  const formatYAxis = (value: number) => {
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`
    return value.toString()
  }

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>روند تراکنش‌ها</CardTitle>
            <CardDescription>تعداد و مبنای تراکنش‌ها در 30 روز اخیر</CardDescription>
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
              <YAxis yAxisId="amount" stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={formatYAxis} />
              <YAxis yAxisId="transactions" orientation="right" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Line
                type="monotone"
                dataKey="transactions"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ r: 4 }}
                yAxisId="transactions"
              />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="hsl(var(--accent))"
                strokeDasharray="5 5"
                strokeWidth={2}
                dot={{ r: 4 }}
                yAxisId="amount"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

"use client"

import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { BarChart3, PieChart, TrendingUp, Activity } from "lucide-react"
import { toPersianNumber } from "@/lib/utils"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"

const COLORS = ["hsl(38 100% 45%)", "hsl(220 70% 50%)", "hsl(150 70% 50%)", "hsl(30 70% 50%)"]

export function SpendingPatternsChart() {
  const { data: result, isLoading } = useQuery({
    queryKey: ["spending-patterns-chart"],
    queryFn: () => api.getSpendingPatterns(),
    staleTime: 1000 * 60 * 5,
  })

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />
  }

  if (!result || !result.patterns || result.patterns.length === 0) {
    return <p className="text-center text-muted-foreground py-8">هیچ الگویی یافت نشد</p>
  }

  const chartData = result.patterns.map((p) => ({
    name: p.pattern,
    confidence: Math.round(p.confidence),
    affected: p.affected_count,
  }))

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          تحلیل الگوهای مصرف
        </CardTitle>
        <CardDescription>{result.summary}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                />
                <Bar dataKey="confidence" fill="hsl(38 100% 45%)">
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2">
            {result.patterns.map((pattern, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                <div className="flex items-center gap-2">
                  <Activity className="h-3 w-3 text-primary" />
                  <span className="text-sm">{pattern.description}</span>
                </div>
                <Badge variant="secondary">
                  {toPersianNumber(pattern.affected_count)} تحت تأثیر
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

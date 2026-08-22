"use client"

import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertTriangle, TrendingUp, TrendingDown, Activity } from "lucide-react"
import { toPersianNumber } from "@/lib/utils"

const severityColors = {
  low: "text-blue-500 bg-blue-500/10",
  medium: "text-amber-500 bg-amber-500/10",
  high: "text-red-500 bg-red-500/10",
}

const trendIcons = {
  increasing: TrendingUp,
  decreasing: TrendingDown,
  stable: Activity,
}

export function RiskAlertCard() {
  const { data: alerts, isLoading } = useQuery({
    queryKey: ["risk-alerts"],
    queryFn: api.getRiskAlerts,
  })

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>هشدارهای ریسک</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (!alerts || alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>هشدارهای ریسک</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-4">✓ هیچ هشداری یافت نشد</p>
        </CardContent>
      </Card>
    )
  }

  const sortedAlerts = [...alerts].sort((a, b) => b.risk_score - a.risk_score)

  return (
    <div className="space-y-3">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            هشدارهای ریسک
          </CardTitle>
          <CardDescription>{sortedAlerts.length} هشدار فعال</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {sortedAlerts.slice(0, 5).map((alert) => {
              const TrendIcon = trendIcons[alert.risk_score_trend]
              const highestSeverity = alert.alerts.reduce((max, a) =>
                a.severity === "high" ? "high" : max === "high" ? max : a.severity
              , "low" as "low" | "medium" | "high")

              return (
                <div key={alert.merchant_key} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {alert.merchant_key.slice(0, 12)}...
                    </code>
                    <Badge className={severityColors[highestSeverity]}>
                      {toPersianNumber(Math.round(alert.risk_score))} امتیاز ریسک
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendIcon className="h-3 w-3" />
                    <span className="text-xs text-muted-foreground">
                      {alert.risk_score_trend === "increasing" ? "در حال افزایش" :
                       alert.risk_score_trend === "decreasing" ? "در حال کاهش" : "پایدار"}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {alert.alerts.slice(0, 2).map((a, i) => (
                      <p key={i} className="text-xs text-muted-foreground">
                        {a.message}
                      </p>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

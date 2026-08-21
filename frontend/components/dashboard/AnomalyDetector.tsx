"use client"

import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Activity, CheckCircle2, AlertCircle } from "lucide-react"
import { toPersianNumber, formatPercent } from "@/lib/utils"

const severityIcons = {
  low: CheckCircle2,
  medium: AlertCircle,
  high: AlertCircle,
}

const severityColors = {
  low: "text-blue-500 bg-blue-500/10",
  medium: "text-amber-500 bg-amber-500/10",
  high: "text-red-500 bg-red-500/10",
}

export function AnomalyDetector() {
  const { data: anomalies, isLoading } = useQuery({
    queryKey: ["anomalies"],
    queryFn: api.getAnomalies,
  })

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>کشف ناهنجاری</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (!anomalies || anomalies.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>کشف ناهنجاری</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4 text-green-500">
            <CheckCircle2 className="h-5 w-5 mr-2" />
            <span>بدون ناهنجاری شناسایی شده</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  const sortedAnomalies = [...anomalies].sort(
    (a, b) => Math.abs(b.deviation_pct) - Math.abs(a.deviation_pct)
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-purple-500" />
          کشف ناهنجاری
        </CardTitle>
        <CardDescription>{toPersianNumber(anomalies.length)} ناهنجاری یافت شد</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-48 overflow-y-auto">
          {sortedAnomalies.slice(0, 5).map((anomaly) => {
            const Icon = severityIcons[anomaly.severity]
            return (
              <div key={anomaly.id} className="border rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${severityColors[anomaly.severity].replace("bg-", "text-")}`} />
                    <span className="text-sm font-medium">{anomaly.metric}</span>
                  </div>
                  <Badge className={severityColors[anomaly.severity]}>
                    {formatPercent(anomaly.deviation_pct)}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{anomaly.description}</p>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>مقدار: {toPersianNumber(anomaly.value.toFixed(2))}</span>
                  <span>انتظار: {toPersianNumber(anomaly.expected.toFixed(2))}</span>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { PredictionChart } from "@/components/dashboard/PredictionChart"
import { RiskAlertCard } from "@/components/dashboard/RiskAlertCard"
import { AnomalyDetector } from "@/components/dashboard/AnomalyDetector"
import { AIInsightsCard } from "@/components/dashboard/AIInsightsCard"
import { NowruzAnalysis } from "@/components/dashboard/NowruzAnalysis"
import { TrendingUp, AlertTriangle, Brain, Sparkles } from "lucide-react"

export function AIPanel() {
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">هوش مصنوعی و پیش‌بینی</h2>
        <Badge variant="secondary" className="flex items-center gap-1">
          <Sparkles className="h-3 w-3" />
          هوشمند
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <AIInsightsCard />
        <RiskAlertCard />
        <AnomalyDetector />
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              پیش‌بینی تراکنشات (۳۰ روز آینده)
            </CardTitle>
            <CardDescription>پیش‌بینی هوشمند بر پایه‌ی الگوهای تاریخی</CardDescription>
          </CardHeader>
          <CardContent>
            <PredictionChart />
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              تحلیل نوروز ۱۴۰۵
            </CardTitle>
            <CardDescription>آمار و پیش‌بینی‌های فصلی نوروز</CardDescription>
          </CardHeader>
          <CardContent>
            <NowruzAnalysis />
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
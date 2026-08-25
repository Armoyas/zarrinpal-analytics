"use client"

import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calculator, Database, Info, HelpCircle } from "lucide-react"
import { toPersianNumber } from "@/lib/utils"
import { cn } from "@/lib/utils"

interface MetricDefinition {
  metric_id: string
  name: string
  name_fa: string
  definition: string
  formula: string
  source_columns: string[]
  counting_unit: string
  filters: string[]
  limitations: string
}

export function CalculationDetails({
  children,
}: {
  children?: React.ReactNode
}) {
  const { data: calcData, isLoading } = useQuery({
    queryKey: ["calculation-details"],
    queryFn: () => api.getCalculationDetails(),
    staleTime: 1000 * 60 * 10,
  })

  const triggerButton = children ?? (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
    >
      <HelpCircle className="h-3 w-3 mr-1" />
      چگونه محاسبه شد؟
    </Button>
  )

  return (
    <Dialog>
      <DialogTrigger asChild>{triggerButton}</DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-right">
            <Calculator className="h-5 w-5 text-primary" />
            ردیابی محاسبات
          </DialogTitle>
          <DialogDescription>
            تعریف و فرمول هر متریک — هیچ عددی جعبه سیاه نیست
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {isLoading && (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          )}

          {calcData && (
            <>
              {/* Sales definitions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-right text-sm">
                    تعریف فروش
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between py-1 border-b">
                    <code className="text-xs bg-muted px-2 py-1 rounded" dir="ltr">
                      {calcData.sales_definition_stage1}
                    </code>
                    <span>مرحله ۱ (همه ردیف‌ها):</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <code className="text-xs bg-muted px-2 py-1 rounded" dir="ltr">
                      {calcData.sales_definition_stage2}
                    </code>
                    <span>مرحله ۲ (پرداخت تکمیل شده):</span>
                  </div>
                  {calcData.stage2_sales_rationale && (
                    <div className="pt-2 text-xs text-muted-foreground">
                      <ul className="space-y-1">
                        {calcData.stage2_sales_rationale.map((r: string, i: number) => (
                          <li key={i} className="flex items-start gap-1">
                            <span>•</span>
                            <span>{r}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Metric definitions */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  تعریف متریک‌ها
                </h3>
                {(calcData.metrics || []).map((metric: MetricDefinition) => (
                  <Card key={metric.metric_id}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-right text-sm">
                        <span className="ml-2">{metric.name_fa || metric.name}</span>
                        <code
                          className="text-xs bg-muted px-1.5 py-0.5 rounded"
                          dir="ltr"
                        >
                          {metric.metric_id}
                        </code>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">تعریف:</span>
                        <span className="text-right max-w-[60%]">{metric.definition}</span>
                      </div>
                      <div className="flex justify-between">
                        <code
                          className="text-xs bg-muted px-2 py-1 rounded break-all"
                          dir="ltr"
                        >
                          {metric.formula}
                        </code>
                        <span className="text-muted-foreground">فرمول:</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-right">
                          {metric.source_columns?.join(", ") || "—"}
                        </span>
                        <span className="text-muted-foreground">ستون‌های منبع:</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{metric.counting_unit}</span>
                        <span className="text-muted-foreground">واحد شمارش:</span>
                      </div>
                      {metric.limitations && (
                        <div className="pt-1 text-amber-300/70">
                          <Info className="h-3 w-3 inline mr-1" />
                          {metric.limitations}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

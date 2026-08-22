"use client"

import { useQuery } from "@tanstack/react-query"
import { api, MerchantOverview } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { toPersianNumber, formatCurrencyIRToman } from "@/lib/utils"
import { Medal, Trophy, ArrowUpRight } from "lucide-react"
import Link from "next/link"

export function MerchantRanking({ onMerchantSelect }: {
  onMerchantSelect?: (merchantKey: string) => void
}) {
  const { data: merchants, isLoading } = useQuery<MerchantOverview[]>({
    queryKey: ["merchants-ranking"],
    queryFn: () => api.getMerchants(50),
  })

  if (isLoading) {
    return (
      <Card className="bg-card/50 border-border/50">
        <CardContent className="pt-6">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3">
                <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
                <div className="h-4 bg-muted rounded flex-1 animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!merchants || merchants.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">هیچ فروشگاهی یافت نشد</p>
        </CardContent>
      </Card>
    )
  }

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="h-4 w-4 text-yellow-400" />
    if (index === 1) return <Medal className="h-4 w-4 text-gray-300" />
    if (index === 2) return <Medal className="h-4 w-4 text-amber-400" />
    return <span className="text-xs text-muted-foreground w-4 text-center">{index + 1}</span>
  }

  const getStatusInfo = (successRate: number): { label: string; className: string } => {
    if (successRate >= 80) {
      return { label: "تایید", className: "bg-green-500/20 text-green-400 border-green-500/30" }
    } else if (successRate >= 50) {
      return { label: "Paid", className: "bg-blue-500/20 text-blue-400 border-blue-500/30" }
    } else if (successRate >= 30) {
      return { label: "InBank", className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" }
    } else {
      return { label: "Failed", className: "bg-red-500/20 text-red-400 border-red-500/30" }
    }
  }

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader>
        <CardTitle>رتبه فروشگاه‌ها</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {merchants.map((merchant, index: number) => {
            const statusInfo = getStatusInfo(merchant.success_rate_pct || 0)
            const totalAmount = merchant.total_amount || 0
            const handleClick = () => {
              if (onMerchantSelect) {
                onMerchantSelect(merchant.merchant_key)
              }
            }
            return (
              <div
                key={merchant.merchant_key}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer group"
                onClick={handleClick}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                    {getRankIcon(index)}
                  </div>
                  <div>
                    <p className="font-medium text-foreground flex items-center gap-2">
                      <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                        {merchant.merchant_key}
                      </code>
                      <span className="text-xs text-muted-foreground">
                        {merchant.category_title || "-"}
                      </span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {merchant.total_attempts || 0} تلاش پرداخت
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={cn("px-2 py-1 rounded text-xs border", statusInfo.className)}>
                    {statusInfo.label}
                  </span>
                  <span className="text-sm font-medium text-right">
                    {formatCurrencyIRToman(totalAmount)}
                  </span>
                  <Link
                    href={`/merchant/${merchant.merchant_key}`}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={handleClick}
                  >
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground hover:text-primary" />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

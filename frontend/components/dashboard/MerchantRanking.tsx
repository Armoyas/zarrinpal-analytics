"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Medal, Trophy, Star } from "lucide-react"

export function MerchantRanking({ data }: { data?: any }) {
  if (!data) return null
  const formatAmount = (amount: number) => {
    const toman = amount / 100000
    if (toman >= 1000000) return `${(toman / 1000000).toFixed(1)}M`
    if (toman >= 1000) return `${(toman / 1000).toFixed(1)}K`
    return toman.toLocaleString()
  }

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="h-4 w-4 text-yellow-400" />
    if (index === 1) return <Medal className="h-4 w-4 text-gray-300" />
    if (index === 2) return <Medal className="h-4 w-4 text-amber-400" />
    return <span className="text-xs text-muted-foreground w-4 text-center">{index + 1}</span>
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Verified": return "bg-green-500/20 text-green-400 border-green-500/30"
      case "Paid": return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "InBank": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "Failed": return "bg-red-500/20 text-red-400 border-red-500/30"
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader>
        <CardTitle>رتبه فروشگاه‌ها</CardTitle>
        <CardDescription>برترین فروشگاه‌ها بر اساس حجم تراکنش</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.slice(0, 10).map((merchant: any, index: number) => (
            <div key={merchant.merchant_key} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                  {getRankIcon(index)}
                </div>
                <div>
                  <p className="font-medium text-foreground">{merchant.merchant_key}</p>
                  <p className="text-sm text-muted-foreground">
                    {merchant.transaction_count.toLocaleString()} تراکنش
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge className={cn(getStatusColor(merchant.status))}>
                  {merchant.status === "Verified" ? "تایید" : merchant.status}
                </Badge>
                <span className="text-sm font-medium text-right">
                  {formatAmount(merchant.total_amount)} تومان
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

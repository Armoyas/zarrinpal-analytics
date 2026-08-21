import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { BarChart3, TrendingUp, TrendingDown } from "lucide-react"

export function PeerComparison({ data }: { data: any }) {
  const currentUser = data.current_user
  const percentile = data.percentile

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader>
        <CardTitle>مقایسه با همتاها</CardTitle>
        <CardDescription>جایگاه شما نسبت به سایر فروشگاه‌ها</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">درصد برتری</span>
            <span className="font-bold text-2xl text-primary">{percentile}٪</span>
          </div>
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${percentile}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            شما در {percentile}٪ برتر هستید
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-2">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-400">{currentUser.success_rate.toFixed(1)}%</p>
            <p className="text-xs text-muted-foreground">نرخ موفقیت</p>
          </div>
          <div className="text-center">
            <p className={cn(
              "text-2xl font-bold",
              currentUser.avg_transaction > data.peer_avg_transaction
                ? "text-green-400"
                : "text-amber-400"
            )}>
              {((currentUser.avg_transaction / data.peer_avg_transaction) * 100 - 100).toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground">میانگین تراکنش</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-400">{currentUser.refund_rate.toFixed(1)}%</p>
            <p className="text-xs text-muted-foreground">نرخ بازگشت</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

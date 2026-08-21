import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Lightbulb, Shield, TrendingUp, Users, AlertCircle, Target } from "lucide-react"

const recommendationIcons: Record<string, React.ReactNode> = {
  optimization: <TrendingUp className="h-5 w-5 text-blue-400" />,
  security: <Shield className="h-5 w-5 text-green-400" />,
  growth: <Users className="h-5 w-5 text-purple-400" />,
  risk: <AlertCircle className="h-5 w-5 text-amber-400" />,
  targeting: <Target className="h-5 w-5 text-cyan-400" />,
  default: <Lightbulb className="h-5 w-5 text-yellow-400" />,
}

const recommendationColors: Record<string, string> = {
  optimization: "border-blue-500/30 bg-blue-500/10 text-blue-300",
  security: "border-green-500/30 bg-green-500/10 text-green-300",
  growth: "border-purple-500/30 bg-purple-500/10 text-purple-300",
  risk: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  targeting: "border-cyan-500/30 bg-cyan-500/10 text-cyan-300",
  default: "border-yellow-500/30 bg-yellow-500/10 text-yellow-300",
}

export function RecommendationPanel({ data }: { data: any }) {
  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader>
        <CardTitle>پیشنهادات هوشمند</CardTitle>
        <CardDescription>تحلیلات و پیشنهادات مبتنی بر هوش مصنوعی برای بهبود عملکرد</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.map((rec: any, index: number) => (
          <div
            key={index}
            className={`rounded-lg border p-4 ${recommendationColors[rec.type] || recommendationColors.default}`}
          >
            <div className="flex items-start gap-3">
              {recommendationIcons[rec.type] || recommendationIcons.default}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium">{rec.title}</p>
                  <Badge
                    variant="outline"
                    className={recommendationColors[rec.type] || recommendationColors.default}
                  >
                    {rec.priority}
                  </Badge>
                </div>
                <p className="text-sm opacity-90">{rec.description}</p>
                {rec.action && (
                  <p className="text-sm mt-2 opacity-75">
                    💡 {rec.action}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

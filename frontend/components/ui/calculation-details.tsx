import { ChevronDown, Info } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export interface CalculationItem {
  label: string;
  formula: string;
  countingUnit: string;
  sourceColumns: string[];
  result: string;
  filters?: Record<string, unknown>;
  limitations?: string | null;
  warning?: string;
  definition?: string;
}

interface CalculationDetailsProps {
  items: CalculationItem[];
  title?: string;
}

export function CalculationDetails({ items, title = "جزئیات محاسبه" }: CalculationDetailsProps) {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          تمام معیاره‌ها در بک‌اند (DuckDB) محاسبه می‌شوند؛ اینجا برای شفافیت نمایش داده شده‌اند.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="border border-dashed rounded-lg p-3 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold">{item.label}</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="font-medium">تعریف:</p>
                      <p className="text-sm">{item.definition || item.label}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              {item.warning && (
                <div className="text-xs text-red-600 bg-red-50 dark:bg-red-950/30 p-2 rounded">
                  ⚠️ {item.warning}
                </div>
              )}

              <div className="text-sm">
                <span className="font-mono bg-muted px-2 py-1 rounded text-xs">
                  {item.formula}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">نتیجه:</span>{" "}
                  <span className="font-medium">{item.result}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">واحد شمارش:</span>{" "}
                  {item.countingUnit}
                </div>
                <div>
                  <span className="text-muted-foreground">ستون‌های منبع:</span>{" "}
                  {item.sourceColumns.join("، ")}
                </div>
                {item.filters && Object.keys(item.filters).length > 0 && (
                  <div>
                    <span className="text-muted-foreground">فیلترها:</span>{" "}
                    {Object.entries(item.filters)
                      .map(([k, v]) => `${k}=${String(v)}`)
                      .join("، ")}
                  </div>
                )}
                {item.limitations && (
                  <div className="md:col-span-2 text-xs text-muted-foreground">
                    <span className="font-medium">محدودیت:</span> {item.limitations}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

"use client"

import { CalendarDays, X, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface DateRangeFilterProps {
  startDate: string | null
  endDate: string | null
  onChange: (start: string | null, end: string | null) => void
  onClear: () => void
}

export function DateRangeFilter({ startDate, endDate, onChange, onClear }: DateRangeFilterProps) {
  const startLabel = startDate || "شروع"
  const endLabel = endDate || "پایان"

  const handleClear = () => {
    onClear()
  }

  const hasValue = startDate && endDate

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1 text-sm">
        <CalendarDays className="h-4 w-4 text-muted-foreground" />
        <span className="text-muted-foreground">بازه:</span>
      </div>

      <div className="flex items-center gap-1">
        <input
          type="date"
          className="w-40 px-2 py-1 text-sm border rounded-md bg-background text-right focus:outline-none focus:ring-1 focus:ring-ring"
          value={startDate || ""}
          onChange={(e) => onChange(e.target.value || null, endDate)}
          placeholder="شروع"
        />
        <ChevronDown className="h-3 w-3 text-muted-foreground rotate-90" />
        <input
          type="date"
          className="w-40 px-2 py-1 text-sm border rounded-md bg-background text-right focus:outline-none focus:ring-1 focus:ring-ring"
          value={endDate || ""}
          onChange={(e) => onChange(startDate, e.target.value || null)}
          placeholder="پایان"
        />
      </div>

      {hasValue && (
        <Button variant="ghost" size="sm" onClick={handleClear}>
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  )
}

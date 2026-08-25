"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { CalendarIcon, X } from "lucide-react"
import { toPersianNumber, formatDate } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { DateRange } from "react-day-picker"

export function DateRangeFilter({
  startDate,
  endDate,
  onChange,
  onClear,
}: {
  startDate?: string | null
  endDate?: string | null
  onChange: (start: string | null, end: string | null) => void
  onClear?: () => void
}) {
  const [open, setOpen] = useState(false)
  const [range, setRange] = useState<DateRange | undefined>({
    from: startDate ? new Date(startDate) : undefined,
    to: endDate ? new Date(endDate) : undefined,
  })

  const handleSelect = (range: DateRange | undefined) => {
    setRange(range)
    if (range?.from) {
      const start = range.from.toISOString().split("T")[0]
      const end = range.to ? range.to.toISOString().split("T")[0] : null
      onChange(start, end)
    } else {
      onChange(null, null)
    }
  }

  const handleClear = () => {
    setRange(undefined)
    onChange(null, null)
    onClear?.()
    setOpen(false)
  }

  const formatDisplay = () => {
    if (!startDate && !endDate) {
      return "همه تاریخ‌ها"
    }
    if (startDate && !endDate) {
      return `از ${formatDate(startDate)}`
    }
    if (startDate && endDate) {
      return `${formatDate(startDate)} تا ${formatDate(endDate)}`
    }
    return "همه تاریخ‌ها"
  }

  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-between text-right",
              !startDate && !endDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="h-4 w-4" />
            <span className="flex-1 truncate">{formatDisplay()}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-full max-w-sm p-0"
          align="start"
          sideOffset={5}
        >
          <div className="p-3 border-b">
            <Calendar
              mode="range"
              selected={range}
              onSelect={handleSelect}
              numberOfMonths={1}
              initialFocus
            />
          </div>
          <div className="flex justify-between p-3 bg-muted/30 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              پاک کردن
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setOpen(false)}
              className="text-xs"
            >
              اعمال
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

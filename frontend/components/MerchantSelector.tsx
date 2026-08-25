"use client"

import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, Store, RefreshCw } from "lucide-react"
import { toPersianNumber } from "@/lib/utils"

export function MerchantSelector({
  selectedMerchant,
  onSelect,
  onRefresh,
}: {
  selectedMerchant?: string | null
  onSelect: (merchantKey: string | null) => void
  onRefresh?: () => void
}) {
  const [open, setOpen] = useState(false)

  const { data: merchants, isLoading, refetch } = useQuery({
    queryKey: ["merchants-select"],
    queryFn: () => api.getMerchants(50),
    staleTime: 1000 * 60 * 3,
  })

  const handleRefresh = () => {
    refetch()
    onRefresh?.()
  }

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full min-w-[180px] justify-between text-right"
          >
            <span className="flex items-center gap-2">
              <Store className="h-4 w-4" />
              {selectedMerchant
                ? selectedMerchant
                : "انتخاب فروشگاه"}
            </span>
            <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-[220px] max-h-[300px] overflow-y-auto"
          align="start"
        >
          <DropdownMenuLabel>
            <div className="flex items-center justify-between">
              <span>فروشگاه‌ها</span>
              <button
                onClick={handleRefresh}
                className="rounded p-1 hover:bg-muted transition-colors"
                aria-label="به‌روزرسانی"
              >
                <RefreshCw className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`} />
              </button>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup
            value={selectedMerchant || ""}
            onValueChange={onSelect}
          >
            <DropdownMenuRadioItem value="" className="text-right">
              <span className="flex-1 text-right">همه فروشگاه‌ها</span>
            </DropdownMenuRadioItem>
            {merchants?.map((m: any) => (
              <DropdownMenuRadioItem
                key={m.merchant_key}
                value={m.merchant_key}
                className="text-right"
              >
                <span className="flex flex-col items-end flex-1">
                  <span>{m.merchant_key}</span>
                  <span className="text-xs text-muted-foreground">
                    {m.category_title || "—"} |{" "}
                    {toPersianNumber(m.total_attempts || 0)} تلاش
                  </span>
                </span>
              </DropdownMenuRadioItem>
            ))}
            {merchants && merchants.length === 0 && (
              <DropdownMenuRadioItem disabled>
                فروشگاهی یافت نشد
              </DropdownMenuRadioItem>
            )}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

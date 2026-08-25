"use client"

import { useState } from "react"
import { ChevronDown, RefreshCw, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { MerchantOverview } from "@/lib/api"

interface MerchantSelectorProps {
  merchants?: MerchantOverview[]
  selectedMerchant: string | null
  onSelect: (merchantKey: string | null) => void
  onRefresh: () => void
  isLoading?: boolean
}

export function MerchantSelector({
  merchants = [],
  selectedMerchant,
  onSelect,
  onRefresh,
  isLoading = false,
}: MerchantSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)

  const filteredMerchants = merchants.filter(
    (m) =>
      m.merchant_key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.category_title || "").toLowerCase().includes(searchQuery.toLowerCase())
  )

  const selectedMerchantObj = merchants.find((m) => m.merchant_key === selectedMerchant)
  const selectedLabel = selectedMerchantObj
    ? `${selectedMerchantObj.merchant_key}${selectedMerchantObj.category_title ? ` — ${selectedMerchantObj.category_title}` : ""}`
    : "انتخاب فروشگاه"

  const handleSelect = (merchantKey: string) => {
    onSelect(merchantKey)
    setIsOpen(false)
    setSearchQuery("")
  }

  const handleClear = () => {
    onSelect(null)
    setSearchQuery("")
  }

  return (
    <div className="w-full sm:w-64">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between gap-2 pr-3 text-right"
            disabled={isLoading}
          >
            <span className="truncate" title={selectedLabel}>
              {selectedLabel}
            </span>
            <ChevronDown className="h-4 w-4 opacity-60 shrink-0" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-full sm:w-64 p-0">
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="جستجو فروشگاه..."
                className="h-8 pl-8 text-right"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </div>
          </div>
          {filteredMerchants.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              فروشگاه یافت نشد
            </div>
          ) : (
            filteredMerchants.map((merchant) => (
              <DropdownMenuItem
                key={merchant.merchant_key}
                onSelect={() => handleSelect(merchant.merchant_key)}
                className="justify-between py-2 cursor-pointer"
              >
                <div className="flex-1 text-right">
                  <div className="font-medium">{merchant.merchant_key}</div>
                  {merchant.category_title && (
                    <div className="text-xs text-muted-foreground">
                      {merchant.category_title}
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground">
                    تراکنش: {merchant.total_attempts} | مبلغ: {merchant.total_amount.toLocaleString("fa-IR")} ریال
                  </div>
                </div>
                {selectedMerchant === merchant.merchant_key && (
                  <div className="mr-2 h-4 w-4 rounded-sm bg-primary flex items-center justify-center shrink-0">
                    <X className="h-3 w-3 text-primary-foreground" />
                  </div>
                )}
              </DropdownMenuItem>
            ))
          )}
          <div className="flex justify-between items-center p-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              disabled={!selectedMerchant}
            >
              <X className="h-3 w-3 ml-1" />
              پاک کردن
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={cn("h-3 w-3 ml-1", isLoading && "animate-spin")} />
              به‌روزرسانی
            </Button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

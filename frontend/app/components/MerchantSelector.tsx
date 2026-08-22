"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { MerchantInfo } from "@/app/types";

interface MerchantSelectorProps {
  merchants: MerchantInfo[];
  selected: string | null;
  onChange: (value: string | null) => void;
}

export function MerchantSelector({
  merchants,
  selected,
  onChange,
}: MerchantSelectorProps) {
  const [open, setOpen] = useState(false);

  const selectedMerchant = merchants.find((m) => m.merchant_key === selected);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 hover:bg-slate-700 transition-colors min-w-[200px] justify-between"
      >
        <span>
          {selectedMerchant
            ? `${selectedMerchant.merchant_key} — ${selectedMerchant.category_title}`
            : "انتخاب فروشنده"}
        </span>
        <ChevronDown className="w-4 h-4" />
      </button>

      {open && (
        <div className="absolute z-10 mt-1 w-full bg-slate-800 border border-slate-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          <button
            onClick={() => {
              onChange(null);
              setOpen(false);
            }}
            className="w-full text-right px-4 py-2 text-sm text-slate-200 hover:bg-slate-700 border-b border-slate-700"
          >
            همه فروشندگان
          </button>
          {merchants.map((merchant) => (
            <button
              key={merchant.merchant_key}
              onClick={() => {
                onChange(merchant.merchant_key);
                setOpen(false);
              }}
              className={`w-full text-right px-4 py-2 text-sm transition-colors ${
                selected === merchant.merchant_key
                  ? "bg-slate-700 text-white"
                  : "text-slate-200 hover:bg-slate-700"
              }`}
            >
              <div className="font-medium">{merchant.merchant_key}</div>
              <div className="text-xs text-slate-400">
                {merchant.category_title}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

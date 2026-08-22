"use client";

import { AlertTriangle } from "lucide-react";

export function DataLimitationWarning() {
  return (
    <div className="bg-amber-900/20 border border-amber-800/50 text-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
      <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
      <div className="text-sm">
        <p className="font-medium mb-1">⚠️ محدودیت‌های داده:</p>
        <ul className="list-disc list-inside mr-4 space-y-1 text-amber-300">
          <li>
            <code>adjusted_fee</code> یک شاخص هزینه مقیاس‌بندی‌شده است، نه هزینه واقعی زرین‌پال.
            مقایسه‌های نسبی معتبر است؛ اما مقادیر مطلق قابل اعتماد نیستند.
          </li>
          <li>
            <code>settled_at</code> حدود ۹۹٪ خالی است — تحلیل تسویه محدود است.
          </li>
          <li>
            <code>payer_card_key</code> حدود ۹۴٪ خالی است — تحلیل رفتارهای تکراری قابل اعتماد نیست.
          </li>
        </ul>
      </div>
    </div>
  );
}

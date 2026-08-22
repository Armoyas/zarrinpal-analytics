"use client";

import { Calendar } from "lucide-react";

interface DateRangeFilterProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
}

export function DateRangeFilter({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: DateRangeFilterProps) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg">
      <Calendar className="w-4 h-4 text-slate-400" />
      <span className="text-sm text-slate-300">بازه زمانی:</span>

      <input
        type="date"
        value={startDate}
        onChange={(e) => onStartDateChange(e.target.value)}
        className="px-2 py-1 bg-slate-900 border border-slate-600 rounded text-slate-200 text-sm focus:outline-none focus:border-slate-500"
      />
      <span className="text-slate-400">تا</span>
      <input
        type="date"
        value={endDate}
        onChange={(e) => onEndDateChange(e.target.value)}
        className="px-2 py-1 bg-slate-900 border border-slate-600 rounded text-slate-200 text-sm focus:outline-none focus:border-slate-500"
      />
    </div>
  );
}

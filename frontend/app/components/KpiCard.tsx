"use client";

import { MetricTrace } from "@/app/types";

interface KpiCardProps {
  title: string;
  value: string;
  metricId: string;
  onClick?: () => void;
}

export function KpiCard({ title, value, metricId, onClick }: KpiCardProps) {
  return (
    <button
      onClick={onClick}
      className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-center cursor-pointer hover:bg-slate-750 transition-all duration-200 group"
    >
      <div className="text-slate-400 text-xs font-medium mb-1">{title}</div>
      <div className="text-2xl font-bold text-white mb-1 group-hover:text-sky-400 transition-colors">
        {value}
      </div>
      <div className="text-xs text-slate-500 group-hover:text-slate-400">
        {metricId}
      </div>
    </button>
  );
}

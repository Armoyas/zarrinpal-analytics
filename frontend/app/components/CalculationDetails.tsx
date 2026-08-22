"use client";

import { MetricTrace } from "@/app/types";
import { X, Info } from "lucide-react";

interface CalculationDetailsProps {
  metric: MetricTrace;
  onClose: () => void;
}

export function CalculationDetails({
  metric,
  onClose,
}: CalculationDetailsProps) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Info className="w-5 h-5 text-sky-400" />
            جزئیات محاسبه
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-slate-200">
          <div>
            <span className="text-slate-400 text-sm">Metric ID:</span>
            <code className="ml-2 text-sky-400 bg-slate-900 px-2 py-1 rounded text-sm">
              {metric.metric_id}
            </code>
          </div>

          <div>
            <span className="text-slate-400 text-sm">Label:</span>
            <span className="mr-2">{metric.label}</span>
          </div>

          <div>
            <span className="text-slate-400 text-sm">Value:</span>
            <span className="mr-2 font-bold text-white">{metric.value}</span>
          </div>

          <div>
            <span className="text-slate-400 text-sm block mb-1">Definition:</span>
            <p className="text-sm">{metric.definition}</p>
          </div>

          <div>
            <span className="text-slate-400 text-sm block mb-1">Formula:</span>
            <code className="block bg-slate-900 px-3 py-2 rounded text-sm text-sky-300">
              {metric.formula}
            </code>
          </div>

          <div>
            <span className="text-slate-400 text-sm block mb-1">
              Source Columns:
            </span>
            <div className="flex flex-wrap gap-2">
              {metric.source_columns.map((col) => (
                <span
                  key={col}
                  className="text-xs bg-slate-900 px-2 py-1 rounded text-sky-300"
                >
                  {col}
                </span>
              ))}
            </div>
          </div>

          <div>
            <span className="text-slate-400 text-sm">Counting Unit:</span>
            <span className="mr-2 text-sky-400">{metric.counting_unit}</span>
          </div>

          {metric.filters && Object.keys(metric.filters).length > 0 && (
            <div>
              <span className="text-slate-400 text-sm block mb-1">
                Filters Applied:
              </span>
              <div className="flex flex-wrap gap-2">
                {Object.entries(metric.filters).map(([key, val]) => (
                  <span
                    key={key}
                    className="text-xs bg-slate-900 px-2 py-1 rounded"
                  >
                    {key}: {String(val)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {metric.limitations && (
            <div className="bg-amber-900/30 border border-amber-800 rounded-lg p-3 mt-4">
              <span className="text-amber-300 text-sm font-medium">
                محدودیت:
              </span>
              <p className="text-amber-200 text-sm mt-1">
                {metric.limitations}
              </p>
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full bg-sky-600 hover:bg-sky-500 text-white py-2 rounded-lg transition-colors"
        >
          بستن
        </button>
      </div>
    </div>
  );
}

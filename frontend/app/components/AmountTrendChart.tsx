"use client";

import { DailyPoint } from "@/app/types";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface AmountTrendChartProps {
  data: DailyPoint[];
}

export function AmountTrendChart({ data }: AmountTrendChartProps) {
  const chartData = data.map((d) => ({
    date: d.date,
    amount: d.amount,
    verified: d.verified,
  }));

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat("fa-IR").format(num);
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
      <h3 className="text-lg font-medium text-slate-200 mb-4">
        روند مبلغ روزانه
      </h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={chartData}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#334155"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            tick={{ fill: "#94a3b8", fontSize: 10 }}
            axisLine={{ stroke: "#334155" }}
            tickLine={{ stroke: "#334155" }}
          />
          <YAxis
            tick={{ fill: "#94a3b8", fontSize: 10 }}
            axisLine={{ stroke: "#334155" }}
            tickLine={{ stroke: "#334155" }}
            tickFormatter={formatCurrency}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1e293b",
              border: "1px solid #334155",
              color: "#f1f5f9",
            }}
            labelStyle={{ color: "#cbd5e1" }}
            formatter={(value: number) => [formatCurrency(value), "مبلغ"]}
          />
          <Line
            type="monotone"
            dataKey="amount"
            stroke="#38bdf8"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

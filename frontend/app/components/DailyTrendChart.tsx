"use client";

import { DailyPoint } from "@/app/types";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface DailyTrendChartProps {
  data: DailyPoint[];
}

export function DailyTrendChart({ data }: DailyTrendChartProps) {
  const chartData = data.map((d) => ({
    date: d.date,
    attempts: d.attempts,
    sessions: d.sessions,
    verified: d.verified,
  }));

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
      <h3 className="text-lg font-medium text-slate-200 mb-4">
        فعالیت روزانه
      </h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={chartData}>
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
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1e293b",
              border: "1px solid #334155",
              color: "#f1f5f9",
            }}
            labelStyle={{ color: "#cbd5e1" }}
          />
          <Bar dataKey="attempts" name="تلاش‌ها" fill="#38bdf8" />
          <Bar dataKey="sessions" name="سشن‌ها" fill="#34d399" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

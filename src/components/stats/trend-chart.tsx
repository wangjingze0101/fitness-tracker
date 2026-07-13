"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { PeriodDataPoint } from "@/types";

interface TrendChartProps {
  data: PeriodDataPoint[];
  height?: number;
}

export function TrendChart({ data, height = 220 }: TrendChartProps) {
  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-muted-foreground">
        暂无趋势数据
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 5, left: -15, bottom: 5 }}>
        <defs>
          <linearGradient id="colorSets" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip
          formatter={(value: number) => [`${value} 组`, "训练量"]}
          contentStyle={{
            borderRadius: "12px",
            border: "1px solid hsl(var(--border))",
            background: "hsl(var(--card))",
          }}
        />
        <Area
          type="monotone"
          dataKey="totalSets"
          stroke="#22c55e"
          strokeWidth={2}
          fill="url(#colorSets)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

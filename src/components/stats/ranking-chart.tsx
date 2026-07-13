"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { ActionRank } from "@/types";

interface RankingChartProps {
  data: ActionRank[];
}

const COLORS = [
  "#22c55e", "#3b82f6", "#f59e0b", "#ef4444",
  "#8b5cf6", "#06b6d4", "#ec4899", "#14b8a6",
];

export function RankingChart({ data }: RankingChartProps) {
  // 横向柱状图：取前10、反转显示
  const chartData = data
    .slice(0, 10)
    .reverse()
    .map((item, i) => ({ ...item, color: COLORS[i % COLORS.length] }));

  if (chartData.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-muted-foreground">
        暂无数据
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={Math.max(240, chartData.length * 40)}>
      <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 40, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fontSize: 13, fill: "hsl(var(--foreground))" }}
          axisLine={false}
          tickLine={false}
          width={80}
        />
        <Tooltip
          formatter={(value: number) => [`${value} 组`, "累计"]}
          contentStyle={{
            borderRadius: "12px",
            border: "1px solid hsl(var(--border))",
            background: "hsl(var(--card))",
          }}
        />
        <Bar dataKey="totalSets" radius={[0, 6, 6, 0]} maxBarSize={24}>
          {chartData.map((entry, index) => (
            <Cell key={index} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

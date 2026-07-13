"use client";

import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import type { BodyMetric } from "@/types";
import { formatDateCN } from "@/lib/date";

interface WeightChartProps {
  metrics: BodyMetric[];
  months?: number;
}

export function WeightChart({ metrics, months = 6 }: WeightChartProps) {
  const chartData = useMemo(() => {
    if (metrics.length === 0) return [];

    // 按日期升序
    const sorted = [...metrics].sort((a, b) => a.date.localeCompare(b.date));

    // 过滤有体重的记录
    const withWeight = sorted.filter((m) => m.weight != null);

    // 取最近 N 个月
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - months);
    const cutoffStr = cutoff.toISOString().slice(0, 10);

    return withWeight
      .filter((m) => m.date >= cutoffStr)
      .map((m) => ({
        date: formatDateCN(m.date),
        weight: m.weight,
        fullDate: m.date,
      }));
  }, [metrics, months]);

  if (chartData.length < 2) {
    return (
      <div className="text-center py-8 text-sm text-muted-foreground">
        需要至少 2 条体重数据才能显示趋势图
      </div>
    );
  }

  const min = Math.min(...chartData.map((d) => d.weight!)) - 1;
  const max = Math.max(...chartData.map((d) => d.weight!)) + 1;

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={chartData} margin={{ top: 10, right: 5, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          domain={[min, max]}
          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: number) => `${v}kg`}
          width={45}
        />
        <Tooltip
          formatter={(value: number) => [`${value} kg`, "体重"]}
          labelFormatter={(label: string) => `${label}`}
          contentStyle={{
            borderRadius: "12px",
            border: "1px solid hsl(var(--border))",
            background: "hsl(var(--card))",
          }}
        />
        {/* 目标参考线 */}
        <ReferenceLine
          y={chartData[0].weight ?? undefined}
          stroke="hsl(var(--muted-foreground))"
          strokeDasharray="5 5"
          strokeOpacity={0.4}
        />
        <Line
          type="monotone"
          dataKey="weight"
          stroke="#22c55e"
          strokeWidth={2.5}
          dot={{ r: 3, fill: "#22c55e" }}
          activeDot={{ r: 6, fill: "#22c55e" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

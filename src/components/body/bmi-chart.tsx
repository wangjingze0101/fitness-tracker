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
  ReferenceArea,
} from "recharts";
import type { BodyMetric } from "@/types";
import { formatDateCN } from "@/lib/date";
import { calculateBMI } from "@/lib/utils";

interface BMIChartProps {
  metrics: BodyMetric[];
  months?: number;
}

export function BMIChart({ metrics, months = 6 }: BMIChartProps) {
  const chartData = useMemo(() => {
    if (metrics.length === 0) return [];

    const sorted = [...metrics].sort((a, b) => a.date.localeCompare(b.date));

    const withBMI = sorted
      .filter((m) => m.weight != null && m.height != null && m.height > 0)
      .map((m) => ({
        date: formatDateCN(m.date),
        bmi: calculateBMI(m.weight, m.height),
        fullDate: m.date,
      }))
      .filter((m) => m.bmi != null);

    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - months);
    const cutoffStr = cutoff.toISOString().slice(0, 10);

    return withBMI.filter((m) => m.fullDate >= cutoffStr);
  }, [metrics, months]);

  if (chartData.length < 2) {
    return (
      <div className="text-center py-8 text-sm text-muted-foreground">
        需要至少 2 条包含身高体重的数据才能显示 BMI 趋势
      </div>
    );
  }

  const values = chartData.map((d) => d.bmi!);
  const minBMI = Math.max(12, Math.min(...values) - 2);
  const maxBMI = Math.min(40, Math.max(...values) + 2);

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
          domain={[minBMI, maxBMI]}
          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: number) => `${v}`}
          width={35}
        />
        <Tooltip
          formatter={(value: number) => [`${value}`, "BMI"]}
          labelFormatter={(label: string) => `${label}`}
          contentStyle={{
            borderRadius: "12px",
            border: "1px solid hsl(var(--border))",
            background: "hsl(var(--card))",
          }}
        />
        {/* 正常范围 18.5-24 */}
        <ReferenceArea
          y1={18.5}
          y2={24}
          fill="#22c55e"
          fillOpacity={0.08}
        />
        <ReferenceLine
          y={18.5}
          stroke="#f59e0b"
          strokeDasharray="4 4"
          strokeOpacity={0.5}
        />
        <ReferenceLine
          y={24}
          stroke="#ef4444"
          strokeDasharray="4 4"
          strokeOpacity={0.5}
        />
        <Line
          type="monotone"
          dataKey="bmi"
          stroke="#8b5cf6"
          strokeWidth={2.5}
          dot={{ r: 3, fill: "#8b5cf6" }}
          activeDot={{ r: 6, fill: "#8b5cf6" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { formatDateCN } from "@/lib/date";
import type { CalendarDay } from "@/types";

interface HeatmapProps {
  data: CalendarDay[];
  year: number;
  onDayClick: (date: string) => void;
}

const LEVEL_COLORS = [
  "bg-muted",                       // 0: 无训练
  "bg-emerald-200 dark:bg-emerald-900/50",   // 1: 1-3 组
  "bg-emerald-300 dark:bg-emerald-800",       // 2: 4-7 组
  "bg-emerald-400 dark:bg-emerald-700",       // 3: 8-15 组
  "bg-emerald-500 dark:bg-emerald-600",       // 4: 16+ 组
];

const MONTHS = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];
const DAY_LABELS = ["", "一", "", "三", "", "五", ""];

export function Heatmap({ data, year, onDayClick }: HeatmapProps) {
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);

  // 计算网格布局：7行 x 约53列
  const grid = useMemo(() => {
    // 获取一年的第一天是周几（0=日, 1=一...）
    const firstDay = new Date(year, 0, 1);
    const startDayOfWeek = firstDay.getDay(); // 0=周日

    // 创建 7行 x 53列 的网格
    const cells: (CalendarDay | null)[][] = Array.from({ length: 7 }, () =>
      Array(53).fill(null)
    );

    const daysMap = new Map(data.map((d) => [d.date, d]));

    for (let d = new Date(year, 0, 1); d.getFullYear() === year; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().slice(0, 10);
      const dayOfYear = Math.floor((d.getTime() - firstDay.getTime()) / 86400000);
      const col = Math.floor((dayOfYear + startDayOfWeek) / 7);
      const row = (d.getDay() + 6) % 7; // Mon=0, Sun=6

      if (col < 53) {
        cells[row][col] = daysMap.get(dateStr) ?? { date: dateStr, totalSets: 0, level: 0 };
      }
    }

    return cells;
  }, [data, year]);

  // 月份标签位置
  const monthLabels = useMemo(() => {
    const labels: { label: string; col: number }[] = [];
    for (let m = 0; m < 12; m++) {
      const firstOfMonth = new Date(year, m, 1);
      const firstDay = new Date(year, 0, 1);
      const dayOfYear = Math.floor((firstOfMonth.getTime() - firstDay.getTime()) / 86400000);
      const startDayOfWeek = firstDay.getDay();
      const col = Math.floor((dayOfYear + startDayOfWeek) / 7);
      if (col < 53) {
        labels.push({ label: MONTHS[m], col });
      }
    }
    return labels;
  }, [year]);

  return (
    <div className="overflow-x-auto -mx-4 px-4">
      <div className="inline-block min-w-[680px]">
        {/* 月份标签 */}
        <div className="flex ml-8 mb-1">
          {monthLabels.map((m, i) => (
            <span
              key={i}
              className="text-[10px] text-muted-foreground"
              style={{
                position: "relative",
                left: `${m.col * 14}px`,
                marginRight: i < monthLabels.length - 1 ? `${(monthLabels[i + 1]?.col ?? 0) - m.col}ch` : "0",
              }}
            >
              {m.label}
            </span>
          ))}
        </div>

        {/* 主体 */}
        <div className="flex gap-1">
          {/* 星期标签 */}
          <div className="flex flex-col gap-[3px] mr-1 pt-0">
            {DAY_LABELS.map((label, i) => (
              <div key={i} className="w-3 h-3 flex items-center justify-center">
                <span className="text-[9px] text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>

          {/* 格子 */}
          <div className="flex gap-[3px]">
            {grid[0].map((_, colIndex) => (
              <div key={colIndex} className="flex flex-col gap-[3px]">
                {grid.map((row, rowIndex) => {
                  const cell = row[colIndex];
                  if (!cell) return <div key={rowIndex} className="w-3 h-3" />;

                  const isHovered = hoveredCell === cell.date;
                  const isToday = cell.date === new Date().toISOString().slice(0, 10);

                  return (
                    <div key={rowIndex} className="relative">
                      <motion.button
                        whileHover={{ scale: 1.4 }}
                        whileTap={{ scale: 0.9 }}
                        onMouseEnter={() => setHoveredCell(cell.date)}
                        onMouseLeave={() => setHoveredCell(null)}
                        onClick={() => onDayClick(cell.date)}
                        className={`w-3 h-3 rounded-sm transition-colors ${LEVEL_COLORS[cell.level]} ${
                          isToday ? "ring-2 ring-primary ring-offset-1 dark:ring-offset-background" : ""
                        }`}
                      />
                      {/* Tooltip */}
                      {isHovered && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-50 pointer-events-none">
                          <div className="bg-foreground text-background text-[10px] px-2 py-1 rounded-md whitespace-nowrap shadow-lg">
                            {formatDateCN(cell.date)} · {cell.totalSets} 组
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* 图例 */}
        <div className="flex items-center justify-end gap-1.5 mt-3 text-[10px] text-muted-foreground">
          <span>少</span>
          {LEVEL_COLORS.map((color, i) => (
            <div key={i} className={`w-3 h-3 rounded-sm ${color}`} />
          ))}
          <span>多</span>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { PageTransition } from "@/components/shared/page-transition";
import { Heatmap } from "@/components/calendar/heatmap";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { useCalendar, useDayDetail } from "@/hooks/use-stats";
import { formatDateFull } from "@/lib/date";

export default function CalendarPage() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const { data: calendarData, loading } = useCalendar(year);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const { detail } = useDayDetail(selectedDate);

  return (
    <AppShell title="打卡日历">
      <PageTransition>
        {/* 年份切换 */}
        <div className="flex items-center justify-between mb-4">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setYear(y => y - 1)}
            className="p-2 rounded-full hover:bg-muted transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </motion.button>
          <span className="text-lg font-semibold">{year} 年</span>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setYear(y => y + 1)}
            disabled={year >= currentYear}
            className={`p-2 rounded-full transition-colors ${
              year >= currentYear ? "text-muted-foreground/30" : "hover:bg-muted"
            }`}
          >
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        </div>

        {/* 热力图 */}
        {loading ? (
          <LoadingSkeleton />
        ) : calendarData ? (
          <div className="rounded-2xl bg-card border border-border p-4 mb-6">
            <Heatmap
              data={calendarData.days}
              year={year}
              onDayClick={setSelectedDate}
            />
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground text-sm">
            无法加载日历数据
          </div>
        )}

        {/* 日期详情弹窗 */}
        {selectedDate && detail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setSelectedDate(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative bg-card border border-border rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            >
              <h3 className="text-lg font-semibold mb-4">
                {formatDateFull(selectedDate)}
              </h3>

              {detail.records.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  这天没有训练记录
                </p>
              ) : (
                <div className="space-y-2 mb-4">
                  {detail.records.map((r) => (
                    <div
                      key={r.actionId}
                      className="flex items-center justify-between p-3 rounded-xl bg-muted"
                    >
                      <span className="text-sm font-medium">{r.actionName}</span>
                      <span className="text-sm font-bold text-primary">
                        {r.sets} 组
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {detail.totalSets > 0 && (
                <p className="text-sm text-center text-muted-foreground mb-4">
                  总计 {detail.totalSets} 组
                </p>
              )}

              <button
                onClick={() => setSelectedDate(null)}
                className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm"
              >
                关闭
              </button>
            </motion.div>
          </div>
        )}
      </PageTransition>
    </AppShell>
  );
}

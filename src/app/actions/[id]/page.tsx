"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { TrendingUp, Clock, CalendarDays } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { SetCounter } from "@/components/checkin/set-counter";
import { PageTransition } from "@/components/shared/page-transition";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { Heatmap } from "@/components/calendar/heatmap";
import { formatDateFull } from "@/lib/date";
import * as api from "@/lib/api";
import type { ActionWithToday, CalendarDay } from "@/types";

type ViewMode = "checkin" | "calendar";

export default function CheckInPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [action, setAction] = useState<ActionWithToday | null>(null);
  const [loading, setLoading] = useState(true);
  const [sets, setSets] = useState(0);
  const [reps, setReps] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>("checkin");
  const [calendarData, setCalendarData] = useState<CalendarDay[]>([]);
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [dayDetail, setDayDetail] = useState<{ sets: number; reps: number } | null>(null);

  const loadAction = useCallback(async () => {
    try {
      const data = await api.fetchActions();
      const found = data.actions.find((a) => a.id === id);
      if (found) {
        setAction(found);
        setSets(found.todaySets);
        // 今天还没打过卡 → 沿用昨天的个数
        setReps(found.todaySets === 0 && found.lastWorkoutReps > 0 ? found.lastWorkoutReps : found.todayReps);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadAction(); }, [loadAction]);

  // 自动保存
  const saveDebounce = useCallback(
    (setsVal: number, repsVal: number) => {
      const timer = setTimeout(() => {
        api.upsertTodayRecord(id, setsVal, repsVal);
      }, 600);
      return () => clearTimeout(timer);
    },
    [id]
  );

  function handleSetsChange(newSets: number) {
    setSets(newSets);
    saveDebounce(newSets, reps);
  }

  function handleRepsChange(newReps: number) {
    setReps(newReps);
    saveDebounce(sets, newReps);
  }

  // 加载动作日历
  async function loadCalendar() {
    setCalendarLoading(true);
    try {
      const res = await fetch(`/api/actions/${id}/calendar?year=${calendarYear}`);
      const data = await res.json();
      setCalendarData(data.days ?? []);
    } catch {
      // ignore
    } finally {
      setCalendarLoading(false);
    }
  }

  useEffect(() => {
    if (viewMode === "calendar") loadCalendar();
  }, [viewMode, calendarYear, id]);

  async function handleDayClick(date: string) {
    setSelectedDate(date);
    // 获取该动作在那天的记录
    try {
      const res = await fetch(`/api/actions/${id}/records`);
      const data = await res.json();
      const record = data.records?.find((r: { date: string }) => r.date === date);
      setDayDetail(record ? { sets: record.sets, reps: record.reps } : { sets: 0, reps: 0 });
    } catch {
      setDayDetail({ sets: 0, reps: 0 });
    }
  }

  if (loading) {
    return (
      <AppShell title="加载中..." showBack backHref="/">
        <LoadingSkeleton />
      </AppShell>
    );
  }

  if (!action) {
    return (
      <AppShell title="动作不存在" showBack backHref="/">
        <div className="text-center py-12 text-muted-foreground">该动作可能已被删除</div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title={action.name}
      showBack
      backHref="/"
      rightAction={
        <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5">
          <button
            onClick={() => setViewMode("checkin")}
            className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${
              viewMode === "checkin" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            打卡
          </button>
          <button
            onClick={() => setViewMode("calendar")}
            className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${
              viewMode === "calendar" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            日历
          </button>
        </div>
      }
    >
      <PageTransition>
        {viewMode === "checkin" ? (
          <>
            {/* 双计数器 */}
            <SetCounter
              sets={sets}
              reps={reps}
              onSetsChange={handleSetsChange}
              onRepsChange={handleRepsChange}
            />

            {/* 统计信息 */}
            <div className="mt-6 grid grid-cols-3 gap-2">
              <div className="p-3 rounded-xl bg-card border border-border text-center">
                <div className="text-[10px] text-muted-foreground mb-0.5">今日</div>
                <p className="text-lg font-bold">{sets} 组</p>
              </div>
              <div className="p-3 rounded-xl bg-card border border-border text-center">
                <div className="text-[10px] text-muted-foreground mb-0.5">累计</div>
                <p className="text-lg font-bold">{action.totalSets} 组</p>
              </div>
              <div className="p-3 rounded-xl bg-card border border-border text-center">
                <div className="text-[10px] text-muted-foreground mb-0.5">总次数</div>
                <p className="text-lg font-bold">{action.totalReps} 次</p>
              </div>
            </div>

            {/* 快捷链接 */}
            <div className="mt-6">
              <button
                onClick={() => router.push(`/history/${id}`)}
                className="w-full py-3 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center justify-center gap-2"
              >
                <Clock className="w-4 h-4" />
                查看历史记录
              </button>
            </div>
          </>
        ) : (
          <>
            {/* 年份切换 */}
            <div className="flex items-center justify-center gap-4 mb-4">
              <button
                onClick={() => setCalendarYear(y => y - 1)}
                className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
              >
                ◀
              </button>
              <span className="font-semibold">{calendarYear} 年</span>
              <button
                onClick={() => setCalendarYear(y => y + 1)}
                disabled={calendarYear >= new Date().getFullYear()}
                className={`p-1.5 rounded-lg transition-colors ${
                  calendarYear >= new Date().getFullYear() ? "text-muted-foreground/30" : "hover:bg-muted text-muted-foreground"
                }`}
              >
                ▶
              </button>
            </div>

            {/* 动作专属热力图 */}
            {calendarLoading ? (
              <LoadingSkeleton />
            ) : (
              <div className="rounded-2xl bg-card border border-border p-4 mb-4">
                <Heatmap
                  data={calendarData}
                  year={calendarYear}
                  onDayClick={handleDayClick}
                />
              </div>
            )}

            {/* 点击日期的详情弹窗 */}
            {selectedDate && dayDetail && (
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
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-muted">
                      <span className="text-sm font-medium">{action.name}</span>
                      <span className="text-sm font-bold text-primary">
                        {dayDetail.sets} 组 × {dayDetail.reps} 次
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedDate(null)}
                    className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm"
                  >
                    关闭
                  </button>
                </motion.div>
              </div>
            )}
          </>
        )}
      </PageTransition>
    </AppShell>
  );
}

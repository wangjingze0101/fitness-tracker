"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  CalendarDays,
  CalendarRange,
  Calendar,
  Infinity,
  Zap,
  TrendingUp,
  Target,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { PageTransition } from "@/components/shared/page-transition";
import { StatCard } from "@/components/stats/stat-card";
import { TrendChart } from "@/components/stats/trend-chart";
import { RankingChart } from "@/components/stats/ranking-chart";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { useStats } from "@/hooks/use-stats";

type Period = "daily" | "weekly" | "monthly" | "lifetime";

const periods: { key: Period; label: string }[] = [
  { key: "daily", label: "本周" },
  { key: "weekly", label: "本月" },
  { key: "monthly", label: "近半年" },
  { key: "lifetime", label: "全部" },
];

export default function StatsPage() {
  const [period, setPeriod] = useState<Period>("monthly");
  const { stats, loading } = useStats(period);

  return (
    <AppShell title="数据统计">
      <PageTransition>
        {/* 统计卡片 */}
        {stats && (
          <div className="grid grid-cols-2 gap-3 mb-6">
            <StatCard
              label="今日训练"
              value={stats.todaySets}
              icon={<Zap className="w-5 h-5" />}
              color="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
            />
            <StatCard
              label="本周训练"
              value={stats.weekSets}
              icon={<CalendarDays className="w-5 h-5" />}
              color="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
            />
            <StatCard
              label="本月训练"
              value={stats.monthSets}
              icon={<CalendarRange className="w-5 h-5" />}
              color="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
            />
            <StatCard
              label="累计训练"
              value={stats.totalAllTimeSets}
              icon={<Infinity className="w-5 h-5" />}
              color="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
            />
          </div>
        )}

        {/* 连续打卡 & 日均 */}
        {stats && (
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="p-4 rounded-2xl bg-card border border-border">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <Target className="w-3.5 h-3.5" />
                连续打卡
              </div>
              <p className="text-2xl font-bold">
                {stats.streak} <span className="text-sm font-normal text-muted-foreground">天</span>
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-card border border-border">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <TrendingUp className="w-3.5 h-3.5" />
                日均训练
              </div>
              <p className="text-2xl font-bold">
                {stats.avgPerDay} <span className="text-sm font-normal text-muted-foreground">组</span>
              </p>
            </div>
          </div>
        )}

        {/* 周期选择 */}
        <div className="flex gap-2 mb-4">
          {periods.map((p) => (
            <motion.button
              key={p.key}
              whileTap={{ scale: 0.95 }}
              onClick={() => setPeriod(p.key)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
                period === p.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {p.label}
            </motion.button>
          ))}
        </div>

        {/* 趋势图 */}
        {loading ? (
          <LoadingSkeleton />
        ) : (
          <>
            <div className="rounded-2xl bg-card border border-border p-4 mb-4">
              <h3 className="text-sm font-semibold mb-3">训练趋势</h3>
              <TrendChart data={stats?.data ?? []} />
            </div>

            {/* 排行榜 */}
            <div className="rounded-2xl bg-card border border-border p-4">
              <h3 className="text-sm font-semibold mb-3">动作排行榜</h3>
              <RankingChart data={stats?.ranking ?? []} />
            </div>
          </>
        )}
      </PageTransition>
    </AppShell>
  );
}

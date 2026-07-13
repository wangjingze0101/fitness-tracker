"use client";

import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sun, Moon, Monitor, Dumbbell, Github } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { PageTransition } from "@/components/shared/page-transition";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const themeOptions = [
    { value: "light", label: "浅色", icon: Sun },
    { value: "dark", label: "深色", icon: Moon },
    { value: "system", label: "跟随系统", icon: Monitor },
  ] as const;

  return (
    <AppShell title="设置">
      <PageTransition>
        {/* 主题设置 */}
        <div className="rounded-2xl bg-card border border-border p-5 mb-4">
          <h3 className="text-sm font-semibold mb-4">外观</h3>
          <div className="flex gap-2">
            {themeOptions.map((opt) => {
              const Icon = opt.icon;
              const isActive = theme === opt.value;
              return (
                <motion.button
                  key={opt.value}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setTheme(opt.value)}
                  className={`flex-1 flex flex-col items-center gap-2 py-3 rounded-xl border transition-all ${
                    isActive
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{opt.label}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* 关于 */}
        <div className="rounded-2xl bg-card border border-border p-5">
          <h3 className="text-sm font-semibold mb-4">关于</h3>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Dumbbell className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-semibold text-foreground">健身打卡</p>
              <p className="text-xs text-muted-foreground">v1.0.0</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            一款简洁、美观的健身打卡应用，帮助你记录每日训练，追踪身体变化，养成运动习惯。
          </p>
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              技术栈：Next.js + TypeScript + Tailwind CSS + Prisma + SQLite
            </p>
          </div>
        </div>
      </PageTransition>
    </AppShell>
  );
}

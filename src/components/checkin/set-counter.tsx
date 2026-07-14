"use client";

import { motion } from "framer-motion";
import { Minus, Plus } from "lucide-react";
import { AnimatedNumber } from "@/components/shared/animated-number";

interface SetCounterProps {
  sets: number;
  reps: number;
  onSetsChange: (sets: number) => void;
  onRepsChange: (reps: number) => void;
}

export function SetCounter({ sets, reps, onSetsChange, onRepsChange }: SetCounterProps) {
  return (
    <div className="flex flex-col items-center gap-8 py-6">
      {/* 组数计数器 */}
      <div className="flex flex-col items-center">
        <span className="text-sm text-muted-foreground mb-2">组数</span>
        <div className="flex items-center gap-5">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => onSetsChange(Math.max(0, sets - 1))}
            disabled={sets <= 0}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
              sets <= 0
                ? "bg-muted text-muted-foreground/40"
                : "bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 shadow-sm"
            }`}
          >
            <Minus className="w-6 h-6" />
          </motion.button>

          <div className="text-5xl font-bold text-foreground tabular-nums w-20 text-center">
            <AnimatedNumber value={sets} />
          </div>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => onSetsChange(sets + 1)}
            className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/25 active:bg-primary/90 transition-all"
          >
            <Plus className="w-6 h-6" />
          </motion.button>
        </div>
        {/* 快捷组数 */}
        <div className="flex gap-2 mt-2">
          {[5, 10].map((n) => (
            <motion.button
              key={n}
              whileTap={{ scale: 0.9 }}
              onClick={() => onSetsChange(sets + n)}
              className="px-3 py-1 rounded-lg border border-border bg-card text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
            >
              +{n}
            </motion.button>
          ))}
        </div>
      </div>

      {/* 个数计数器 */}
      <div className="flex flex-col items-center">
        <span className="text-sm text-muted-foreground mb-2">每组个数</span>
        <div className="flex items-center gap-5">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => onRepsChange(Math.max(0, reps - 1))}
            disabled={reps <= 0}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              reps <= 0
                ? "bg-muted text-muted-foreground/40"
                : "bg-orange-50 dark:bg-orange-900/20 text-orange-500 hover:bg-orange-100 dark:hover:bg-orange-900/30 shadow-sm"
            }`}
          >
            <Minus className="w-5 h-5" />
          </motion.button>

          <div className="text-3xl font-bold text-foreground tabular-nums w-16 text-center">
            <AnimatedNumber value={reps} />
          </div>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => onRepsChange(reps + 1)}
            className="w-12 h-12 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/20 active:bg-orange-600 transition-all"
          >
            <Plus className="w-5 h-5" />
          </motion.button>
        </div>
        {/* 快捷个数 */}
        <div className="flex gap-2 mt-2">
          {[5, 10].map((n) => (
            <motion.button
              key={n}
              whileTap={{ scale: 0.9 }}
              onClick={() => onRepsChange(reps + n)}
              className="px-3 py-1 rounded-lg border border-border bg-card text-xs text-muted-foreground hover:text-foreground hover:border-orange-400/30 transition-colors"
            >
              +{n}
            </motion.button>
          ))}
        </div>
        <span className="text-xs text-muted-foreground mt-1">次 / 组</span>
      </div>

      {/* 总量预览 */}
      {sets > 0 && reps > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 py-2 rounded-full bg-muted"
        >
          <span className="text-sm text-muted-foreground">
            今日总量：<span className="font-bold text-foreground">{sets * reps} 次</span>
          </span>
        </motion.div>
      )}
    </div>
  );
}

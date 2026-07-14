"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight, TrendingUp, MoreVertical, Pencil, Trash2, Check } from "lucide-react";
import type { ActionWithToday } from "@/types";
import { formatDateCN } from "@/lib/date";
import { AnimatedNumber } from "@/components/shared/animated-number";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";

interface ActionCardProps {
  action: ActionWithToday;
  index: number;
  onEdit: (action: ActionWithToday) => void;
  onDelete: (id: string) => void;
  onQuickAdd: (action: ActionWithToday) => void;
}

export function ActionCard({ action, index, onEdit, onDelete, onQuickAdd }: ActionCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [adding, setAdding] = useState(false);

  async function handleDone(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (adding) return;
    setAdding(true);
    await onQuickAdd(action);
    setAdding(false);
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05, duration: 0.3 }}
        className="relative"
      >
        {/* 整行可点击进入详情 */}
        <Link href={`/actions/${action.id}`} className="block">
          <motion.div
            whileTap={{ scale: 0.98 }}
            className="group relative p-4 pr-28 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-foreground mb-2">{action.name}</h3>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    <span>今日</span>
                    <span className="font-bold text-foreground text-sm">
                      <AnimatedNumber value={action.todaySets} />
                    </span>
                    <span>组</span>
                    {action.todayReps > 0 && (
                      <>
                        <span className="font-bold text-foreground text-sm ml-0.5">
                          <AnimatedNumber value={action.todayReps} />
                        </span>
                        <span>次</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    <span>累计</span>
                    <span className="font-semibold text-foreground">{action.totalSets}</span>
                    <span>组</span>
                  </div>
                </div>
                {action.lastWorkoutDate && (
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    上次：{formatDateCN(action.lastWorkoutDate)} · {action.lastWorkoutSets}组
                  </p>
                )}
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground/50 shrink-0 ml-2 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </motion.div>
        </Link>

        {/* DONE 按钮（卡片右侧中间） */}
        <div className="absolute top-1/2 right-14 -translate-y-1/2 z-10">
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={handleDone}
            disabled={adding}
            className="px-3 py-2 rounded-xl bg-primary text-primary-foreground text-[11px] font-bold shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 active:bg-primary/90 transition-all flex items-center gap-1"
          >
            <Check className="w-3.5 h-3.5" />
            DONE
          </motion.button>
        </div>

        {/* 更多操作按钮（右上角） */}
        <div className="absolute top-2 right-2 z-10">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMenuOpen(!menuOpen); }}
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </motion.button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-20" onClick={(e) => { e.stopPropagation(); setMenuOpen(false); }} />
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute right-0 top-9 z-30 bg-card border border-border rounded-xl shadow-xl py-1 min-w-[120px]"
              >
                <button onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onEdit(action); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors">
                  <Pencil className="w-3.5 h-3.5" />编辑名称
                </button>
                <button onClick={(e) => { e.stopPropagation(); setMenuOpen(false); setShowDelete(true); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />删除动作
                </button>
              </motion.div>
            </>
          )}
        </div>
      </motion.div>

      <ConfirmDialog open={showDelete} title="删除动作"
        message={`确定要删除「${action.name}」吗？所有历史记录也会被删除，此操作不可撤销。`}
        variant="danger"
        onConfirm={() => { onDelete(action.id); setShowDelete(false); }}
        onCancel={() => setShowDelete(false)} />
    </>
  );
}

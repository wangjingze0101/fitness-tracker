"use client";

import { motion } from "framer-motion";
import { Trash2, Edit3 } from "lucide-react";
import type { WorkoutRecord } from "@/types";
import { formatDateFull } from "@/lib/date";

interface HistoryListProps {
  records: WorkoutRecord[];
  onEdit: (record: WorkoutRecord) => void;
  onDelete: (date: string) => void;
}

export function HistoryList({ records, onEdit, onDelete }: HistoryListProps) {
  if (records.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-sm">暂无训练记录</p>
        <p className="text-xs mt-1">开始打卡后这里会显示历史记录</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {records.map((record, i) => (
        <motion.div
          key={record.id}
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.03 }}
          className="flex items-center justify-between p-4 rounded-xl bg-card border border-border"
        >
          <div>
            <p className="text-sm font-medium text-foreground">
              {formatDateFull(record.date)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-lg font-bold text-primary tabular-nums">
                {record.sets} <span className="text-xs text-muted-foreground font-normal">组</span>
              </span>
              {record.reps > 0 && (
                <span className="text-sm font-semibold text-orange-500 tabular-nums ml-1">
                  ×{record.reps} <span className="text-[10px] text-muted-foreground font-normal">次</span>
                </span>
              )}
              {record.sets > 0 && record.reps > 0 && (
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  共计 {record.sets * record.reps} 次
                </p>
              )}
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => onEdit(record)}
                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(record.date)}
                className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-muted-foreground hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

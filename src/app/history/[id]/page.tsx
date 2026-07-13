"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { AppShell } from "@/components/layout/app-shell";
import { PageTransition } from "@/components/shared/page-transition";
import { HistoryList } from "@/components/history/history-list";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { useRecords } from "@/hooks/use-records";
import { useActions } from "@/hooks/use-actions";
import type { WorkoutRecord } from "@/types";

export default function HistoryPage() {
  const params = useParams();
  const id = params.id as string;
  const { actions } = useActions();
  const { records, loading, updateSets, removeRecord } = useRecords(id);

  const action = actions.find((a) => a.id === id);
  const [editRecord, setEditRecord] = useState<WorkoutRecord | null>(null);
  const [editSets, setEditSets] = useState(0);
  const [editReps, setEditReps] = useState(0);
  const [deleteDate, setDeleteDate] = useState<string | null>(null);

  return (
    <AppShell
      title={action ? `${action.name} · 历史` : "历史记录"}
      showBack
      backHref="/"
    >
      <PageTransition>
        {loading ? (
          <LoadingSkeleton />
        ) : (
          <HistoryList
            records={records}
            onEdit={(record) => {
              setEditRecord(record);
              setEditSets(record.sets);
              setEditReps(record.reps);
            }}
            onDelete={(date) => setDeleteDate(date)}
          />
        )}

        {/* 编辑弹窗 */}
        {editRecord && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setEditRecord(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative bg-card border border-border rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            >
              <h3 className="text-lg font-semibold mb-1">修改训练记录</h3>
              <p className="text-xs text-muted-foreground mb-4">{editRecord.date}</p>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  await updateSets(editRecord.date, editSets, editReps);
                  setEditRecord(null);
                }}
              >
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">组数</label>
                    <input
                      type="number"
                      min={0}
                      value={editSets}
                      onChange={(e) => setEditSets(parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground text-lg font-bold text-center focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">每组个数</label>
                    <input
                      type="number"
                      min={0}
                      value={editReps}
                      onChange={(e) => setEditReps(parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground text-lg font-bold text-center focus:outline-none focus:ring-2 focus:ring-orange-400/30"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setEditRecord(null)}
                    className="flex-1 py-2.5 rounded-xl border border-border text-sm hover:bg-muted transition-colors"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium"
                  >
                    保存
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* 删除确认 */}
        <ConfirmDialog
          open={!!deleteDate}
          title="删除记录"
          message={`确定要删除 ${deleteDate} 的训练记录吗？此操作不可撤销。`}
          variant="danger"
          onConfirm={() => {
            if (deleteDate) {
              removeRecord(deleteDate);
              setDeleteDate(null);
            }
          }}
          onCancel={() => setDeleteDate(null)}
        />
      </PageTransition>
    </AppShell>
  );
}

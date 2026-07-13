"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Dumbbell, Flame } from "lucide-react";
import { useActions } from "@/hooks/use-actions";
import { ActionList } from "@/components/home/action-list";
import { PageTransition } from "@/components/shared/page-transition";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { AnimatedNumber } from "@/components/shared/animated-number";
import type { ActionWithToday } from "@/types";
import * as api from "@/lib/api";

export default function HomePage() {
  const { actions, loading, load, update, remove, reorder } = useActions();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [editingAction, setEditingAction] = useState<ActionWithToday | null>(null);

  const todayTotal = actions.reduce((sum, a) => sum + a.todaySets, 0);

  async function handleAdd() {
    if (!newName.trim()) return;
    await api.createAction(newName.trim());
    setNewName("");
    setDialogOpen(false);
    await load();
  }

  async function handleEdit(action: ActionWithToday) {
    setEditingAction(action);
    setNewName(action.name);
    setDialogOpen(true);
  }

  async function handleSaveEdit() {
    if (!newName.trim() || !editingAction) return;
    await update(editingAction.id, newName.trim());
    setNewName("");
    setEditingAction(null);
    setDialogOpen(false);
  }

  async function handleDelete(id: string) {
    await remove(id);
  }

  return (
    <PageTransition>
      {/* 顶部概览卡片 */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 p-5 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/20"
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-white/80">今日训练</h2>
          <Flame className="w-5 h-5 text-orange-300" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold tabular-nums">
            <AnimatedNumber value={todayTotal} />
          </span>
          <span className="text-white/70 text-lg">组</span>
        </div>
        <p className="mt-2 text-xs text-white/60">
          {actions.length > 0
            ? `${actions.length} 个训练动作`
            : "点击下方按钮开始添加动作"}
        </p>
      </motion.div>

      {/* 动作列表 */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-muted-foreground">训练动作</h3>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            setEditingAction(null);
            setNewName("");
            setDialogOpen(true);
          }}
          className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          添加
        </motion.button>
      </div>

      {loading ? (
        <LoadingSkeleton />
      ) : actions.length === 0 ? (
        <EmptyState
          icon={<Dumbbell className="w-8 h-8" />}
          title="还没有训练动作"
          description="添加你的第一个训练动作，开始健身打卡之旅"
          action={
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setEditingAction(null);
                setNewName("");
                setDialogOpen(true);
              }}
              className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm shadow-sm"
            >
              添加动作
            </motion.button>
          }
        />
      ) : (
        <ActionList
          actions={actions}
          onReorder={reorder}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* 添加/编辑动作弹窗 */}
      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              setDialogOpen(false);
              setEditingAction(null);
            }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-card border border-border rounded-2xl p-6 max-w-sm w-full shadow-2xl"
          >
            <h3 className="text-lg font-semibold mb-4">
              {editingAction ? "编辑动作名称" : "添加训练动作"}
            </h3>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (editingAction ? handleSaveEdit() : handleAdd())}
              placeholder="输入动作名称，如：引体向上"
              className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 mb-4"
              autoFocus
            />
            {!editingAction && (
              <div className="grid grid-cols-2 gap-2 mb-4">
                {["引体向上", "俯卧撑", "深蹲", "跑步", "平板支撑", "双杠臂屈伸"].map(
                  (name) => (
                    <button
                      key={name}
                      onClick={() => setNewName(name)}
                      className="px-3 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      {name}
                    </button>
                  )
                )}
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setDialogOpen(false);
                  setEditingAction(null);
                }}
                className="flex-1 py-2.5 rounded-xl border border-border font-medium text-sm hover:bg-muted transition-colors"
              >
                取消
              </button>
              <button
                onClick={editingAction ? handleSaveEdit : handleAdd}
                disabled={!newName.trim()}
                className={`flex-1 py-2.5 rounded-xl font-medium text-sm text-white transition-all ${
                  newName.trim()
                    ? "bg-primary hover:bg-primary/90"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {editingAction ? "保存" : "添加"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </PageTransition>
  );
}

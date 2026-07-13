"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { AppShell } from "@/components/layout/app-shell";
import { PageTransition } from "@/components/shared/page-transition";
import { BodyForm } from "@/components/body/body-form";
import { WeightChart } from "@/components/body/weight-chart";
import { BMIChart } from "@/components/body/bmi-chart";
import { BodyMetricsList } from "@/components/body/body-metrics-list";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { useBodyMetrics } from "@/hooks/use-body-metrics";
import type { BodyMetric } from "@/types";

export default function BodyPage() {
  const { metrics, loading, save, remove } = useBodyMetrics();
  const [editMetric, setEditMetric] = useState<BodyMetric | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // 获取最新身高用于默认值
  const latestHeight = metrics.find((m) => m.height != null)?.height;
  const latestWeight = metrics.find((m) => m.weight != null)?.weight;

  return (
    <AppShell title="身体数据">
      <PageTransition>
        {/* 录入表单 */}
        <div className="mb-6">
          <BodyForm
            defaultWeight={latestWeight}
            defaultHeight={latestHeight}
            onSave={save}
          />
        </div>

        {loading ? (
          <LoadingSkeleton />
        ) : (
          <>
            {/* 体重趋势图 */}
            {metrics.filter((m) => m.weight != null).length >= 2 && (
              <div className="rounded-2xl bg-card border border-border p-4 mb-4">
                <h3 className="text-sm font-semibold mb-3">体重趋势</h3>
                <WeightChart metrics={metrics} />
              </div>
            )}

            {/* BMI 趋势图 */}
            {metrics.filter((m) => m.weight != null && m.height != null).length >= 2 && (
              <div className="rounded-2xl bg-card border border-border p-4 mb-6">
                <h3 className="text-sm font-semibold mb-3">BMI 趋势</h3>
                <BMIChart metrics={metrics} />
              </div>
            )}

            {/* 历史记录 */}
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">
              历史记录
            </h3>
            <BodyMetricsList
              metrics={metrics}
              onEdit={setEditMetric}
              onDelete={(id) => setDeleteId(id)}
            />
          </>
        )}

        {/* 编辑弹窗 */}
        {editMetric && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setEditMetric(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative bg-card border border-border rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            >
              <h3 className="text-lg font-semibold mb-4">编辑身体数据</h3>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const form = e.target as HTMLFormElement;
                  const weight = (form.elements.namedItem("weight") as HTMLInputElement).value;
                  const height = (form.elements.namedItem("height") as HTMLInputElement).value;
                  const note = (form.elements.namedItem("note") as HTMLInputElement).value;
                  await save({
                    date: editMetric.date,
                    weight: weight ? parseFloat(weight) : undefined,
                    height: height ? parseFloat(height) : undefined,
                    note: note || undefined,
                  });
                  setEditMetric(null);
                }}
              >
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">体重 (kg)</label>
                    <input
                      name="weight"
                      type="number"
                      step="0.1"
                      defaultValue={editMetric.weight ?? ""}
                      className="w-full px-3 py-2 rounded-xl bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">身高 (cm)</label>
                    <input
                      name="height"
                      type="number"
                      step="0.1"
                      defaultValue={editMetric.height ?? ""}
                      className="w-full px-3 py-2 rounded-xl bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="text-xs text-muted-foreground mb-1 block">备注</label>
                  <input
                    name="note"
                    type="text"
                    defaultValue={editMetric.note ?? ""}
                    className="w-full px-3 py-2 rounded-xl bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setEditMetric(null)}
                    className="flex-1 py-2 rounded-xl border border-border text-sm hover:bg-muted transition-colors"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium"
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
          open={!!deleteId}
          title="删除记录"
          message="确定要删除这条身体数据吗？此操作不可撤销。"
          variant="danger"
          onConfirm={() => {
            if (deleteId) {
              remove(deleteId);
              setDeleteId(null);
            }
          }}
          onCancel={() => setDeleteId(null)}
        />
      </PageTransition>
    </AppShell>
  );
}

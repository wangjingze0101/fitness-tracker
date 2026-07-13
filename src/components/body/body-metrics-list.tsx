"use client";

import { motion } from "framer-motion";
import { Trash2, Edit3 } from "lucide-react";
import type { BodyMetric } from "@/types";
import { formatDateFull } from "@/lib/date";
import { calculateBMI, getBMICategory } from "@/lib/utils";

interface BodyMetricsListProps {
  metrics: BodyMetric[];
  onEdit: (metric: BodyMetric) => void;
  onDelete: (id: string) => void;
}

export function BodyMetricsList({ metrics, onEdit, onDelete }: BodyMetricsListProps) {
  if (metrics.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-muted-foreground">
        暂无身体数据记录
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {metrics.map((metric, i) => {
        const bmi = calculateBMI(metric.weight, metric.height);
        const category = bmi ? getBMICategory(bmi) : null;

        return (
          <motion.div
            key={metric.id}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
            className="flex items-center justify-between p-4 rounded-xl bg-card border border-border"
          >
            <div>
              <p className="text-sm font-medium text-foreground">
                {formatDateFull(metric.date)}
              </p>
              {metric.note && (
                <p className="text-xs text-muted-foreground mt-0.5">{metric.note}</p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                {metric.weight != null && (
                  <p className="text-sm font-semibold">
                    {metric.weight} <span className="text-[10px] text-muted-foreground">kg</span>
                  </p>
                )}
                {bmi != null && (
                  <p className={`text-xs font-medium ${category?.color ?? ""}`}>
                    BMI {bmi} {category?.label ?? ""}
                  </p>
                )}
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => onEdit(metric)}
                  className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(metric.id)}
                  className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-muted-foreground hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

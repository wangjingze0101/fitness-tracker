"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";

interface BodyFormProps {
  defaultWeight?: number | null;
  defaultHeight?: number | null;
  onSave: (data: { date: string; weight?: number; height?: number; note?: string }) => void;
}

export function BodyForm({ defaultWeight, defaultHeight, onSave }: BodyFormProps) {
  const [weight, setWeight] = useState(defaultWeight?.toString() ?? "");
  const [height, setHeight] = useState(defaultHeight?.toString() ?? "");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const bmi = (() => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    if (!w || !h || h <= 0) return null;
    return Math.round((w / ((h / 100) * (h / 100))) * 10) / 10;
  })();

  const bmiCategory = bmi
    ? bmi < 18.5
      ? { label: "偏瘦", color: "text-blue-500" }
      : bmi < 24
      ? { label: "正常", color: "text-green-500" }
      : bmi < 28
      ? { label: "偏胖", color: "text-yellow-500" }
      : { label: "肥胖", color: "text-red-500" }
    : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await onSave({
      date: new Date().toISOString().slice(0, 10),
      weight: weight ? parseFloat(weight) : undefined,
      height: height ? parseFloat(height) : undefined,
      note: note || undefined,
    });
    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="p-5 rounded-2xl bg-card border border-border">
      <h3 className="text-sm font-semibold mb-4">记录今日身体数据</h3>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">体重 (kg)</label>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="70.5"
            step="0.1"
            min="30"
            max="300"
            className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">身高 (cm)</label>
          <input
            type="number"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            placeholder="175"
            step="0.1"
            min="100"
            max="250"
            className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
          />
        </div>
      </div>

      {/* BMI 实时预览 */}
      {bmi !== null && (
        <div className="mb-4 p-3 rounded-xl bg-muted flex items-center justify-between">
          <span className="text-sm text-muted-foreground">BMI</span>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold">{bmi}</span>
            {bmiCategory && (
              <span className={`text-xs font-medium ${bmiCategory.color}`}>
                {bmiCategory.label}
              </span>
            )}
          </div>
        </div>
      )}

      <div className="mb-4">
        <label className="text-xs text-muted-foreground mb-1 block">备注</label>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="有什么想记录的吗？"
          className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
        />
      </div>

      <motion.button
        type="submit"
        disabled={saving || (!weight && !height)}
        whileTap={{ scale: 0.97 }}
        className={`w-full py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all ${
          saving || (!weight && !height)
            ? "bg-muted text-muted-foreground"
            : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
        }`}
      >
        <Plus className="w-4 h-4" />
        {saving ? "保存中..." : "记录身体数据"}
      </motion.button>
    </form>
  );
}

"use client";

import { motion } from "framer-motion";

interface QuickActionsProps {
  onAdd: (n: number) => void;
  onReset: () => void;
}

const presets = [
  { label: "+1", value: 1 },
  { label: "+5", value: 5 },
  { label: "+10", value: 10 },
];

export function QuickActions({ onAdd, onReset }: QuickActionsProps) {
  return (
    <div className="flex items-center justify-center gap-3">
      {presets.map((p) => (
        <motion.button
          key={p.value}
          whileTap={{ scale: 0.9 }}
          onClick={() => onAdd(p.value)}
          className="px-5 py-2 rounded-full border border-border bg-card text-sm font-medium text-foreground hover:bg-muted transition-colors"
        >
          {p.label}
        </motion.button>
      ))}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={onReset}
        className="px-5 py-2 rounded-full border border-red-200 dark:border-red-800 bg-card text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
      >
        归零
      </motion.button>
    </div>
  );
}

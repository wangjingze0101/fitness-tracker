"use client";

import { motion } from "framer-motion";
import { AnimatedNumber } from "@/components/shared/animated-number";

interface StatCardProps {
  label: string;
  value: number;
  unit?: string;
  icon: React.ReactNode;
  color?: string;
}

export function StatCard({ label, value, unit = "组", icon, color = "bg-primary/10 text-primary" }: StatCardProps) {
  return (
    <motion.div
      whileTap={{ scale: 0.97 }}
      className="p-4 rounded-2xl bg-card border border-border"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          {icon}
        </div>
        <span className="text-xs text-muted-foreground font-medium">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-bold text-foreground tabular-nums">
          <AnimatedNumber value={value} />
        </span>
        <span className="text-sm text-muted-foreground">{unit}</span>
      </div>
    </motion.div>
  );
}

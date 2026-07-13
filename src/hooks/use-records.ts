"use client";

import { useState, useEffect, useCallback } from "react";
import type { WorkoutRecord } from "@/types";
import * as api from "@/lib/api";

/**
 * 管理某个动作的历史训练记录
 */
export function useRecords(actionId: string) {
  const [records, setRecords] = useState<WorkoutRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!actionId) return;
    try {
      setLoading(true);
      const data = await api.fetchRecords(actionId);
      setRecords(data.records);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }, [actionId]);

  useEffect(() => {
    load();
  }, [load]);

  const updateSets = useCallback(
    async (date: string, sets: number, reps: number = 0) => {
      await api.updateRecord(actionId, date, sets, reps);
      await load();
    },
    [actionId, load]
  );

  const removeRecord = useCallback(
    async (date: string) => {
      await api.deleteRecord(actionId, date);
      setRecords((prev) => prev.filter((r) => r.date !== date));
    },
    [actionId]
  );

  return { records, loading, error, load, updateSets, removeRecord };
}

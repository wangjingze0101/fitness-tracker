"use client";

import { useState, useEffect, useCallback } from "react";
import type { BodyMetric } from "@/types";
import * as api from "@/lib/api";

/**
 * 身体数据管理 hook
 */
export function useBodyMetrics() {
  const [metrics, setMetrics] = useState<BodyMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.fetchBodyMetrics();
      setMetrics(data.metrics);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = useCallback(
    async (data: { date: string; weight?: number; height?: number; note?: string }) => {
      await api.createBodyMetric(data);
      await load();
    },
    [load]
  );

  const update = useCallback(
    async (id: string, data: { weight?: number; height?: number; note?: string }) => {
      await api.updateBodyMetric(id, data);
      await load();
    },
    [load]
  );

  const remove = useCallback(async (id: string) => {
    await api.deleteBodyMetric(id);
    setMetrics((prev) => prev.filter((m) => m.id !== id));
  }, []);

  return { metrics, loading, error, load, save, update, remove };
}

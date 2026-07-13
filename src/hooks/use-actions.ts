"use client";

import { useState, useEffect, useCallback } from "react";
import type { ActionWithToday } from "@/types";
import * as api from "@/lib/api";

/**
 * 管理训练动作列表
 */
export function useActions() {
  const [actions, setActions] = useState<ActionWithToday[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.fetchActions();
      setActions(data.actions);
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

  const add = useCallback(async (name: string) => {
    await api.createAction(name);
    await load();
  }, [load]);

  const update = useCallback(async (id: string, name: string) => {
    await api.updateAction(id, name);
    setActions((prev) =>
      prev.map((a) => (a.id === id ? { ...a, name } : a))
    );
  }, []);

  const remove = useCallback(async (id: string) => {
    await api.deleteAction(id);
    setActions((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const reorder = useCallback(async (orderedIds: string[]) => {
    setActions((prev) => {
      const map = new Map(prev.map((a) => [a.id, a]));
      return orderedIds
        .map((id, i) => {
          const action = map.get(id);
          return action ? { ...action, sortOrder: i } : null;
        })
        .filter(Boolean) as ActionWithToday[];
    });
    await api.reorderActions(orderedIds);
  }, []);

  return { actions, loading, error, load, add, update, remove, reorder };
}

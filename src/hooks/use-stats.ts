"use client";

import { useState, useEffect, useCallback } from "react";
import type { StatsResponse, CalendarResponse, DayDetail } from "@/types";
import * as api from "@/lib/api";

/**
 * 统计数据 hook
 */
export function useStats(period: string = "monthly") {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.fetchStats(period);
      setStats(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    load();
  }, [load]);

  return { stats, loading, error, load };
}

/**
 * 日历热力图数据 hook
 */
export function useCalendar(year: number) {
  const [data, setData] = useState<CalendarResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const result = await api.fetchCalendar(year);
      setData(result);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [year]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, load };
}

/**
 * 某天详情 hook
 */
export function useDayDetail(date: string | null) {
  const [detail, setDetail] = useState<DayDetail | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!date) return;
    try {
      setLoading(true);
      const result = await api.fetchDayDetail(date);
      setDetail(result);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    load();
  }, [load]);

  return { detail, loading, load };
}

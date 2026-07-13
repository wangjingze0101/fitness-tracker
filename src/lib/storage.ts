/**
 * Supabase 数据库存储层
 * 使用 PostgreSQL 数据库，支持云端部署和数据持久化
 */

import { supabase, TABLES } from "./supabase";

// ========== ID 生成 ==========

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

// ========== Actions API ==========

export async function getActions() {
  const { data, error } = await supabase
    .from(TABLES.ACTIONS)
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data.map(mapAction);
}

export async function getActionById(id: string) {
  const { data, error } = await supabase
    .from(TABLES.ACTIONS)
    .select("*")
    .eq("id", id)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data ? mapAction(data) : undefined;
}

export async function createAction(name: string) {
  // 获取最大 sortOrder
  const { data: existing } = await supabase
    .from(TABLES.ACTIONS)
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1);

  const maxOrder = (existing?.[0]?.sort_order ?? -1) + 1;

  const { data, error } = await supabase
    .from(TABLES.ACTIONS)
    .insert({ id: generateId(), name: name.trim(), sort_order: maxOrder })
    .select()
    .single();

  if (error) throw error;
  return mapAction(data);
}

export async function updateAction(id: string, name: string) {
  const { data, error } = await supabase
    .from(TABLES.ACTIONS)
    .update({ name: name.trim() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data ? mapAction(data) : null;
}

export async function deleteAction(id: string): Promise<boolean> {
  const { error } = await supabase
    .from(TABLES.ACTIONS)
    .delete()
    .eq("id", id);

  // 注意：workout_records 设置了 ON DELETE CASCADE，会自动删除
  return !error;
}

export async function reorderActions(orderedIds: string[]) {
  for (let i = 0; i < orderedIds.length; i++) {
    await supabase
      .from(TABLES.ACTIONS)
      .update({ sort_order: i })
      .eq("id", orderedIds[i]);
  }
  return true;
}

// ========== Workout Records API ==========

export async function getRecordsByAction(actionId: string) {
  const { data, error } = await supabase
    .from(TABLES.WORKOUT_RECORDS)
    .select("*")
    .eq("action_id", actionId)
    .order("date", { ascending: false });

  if (error) throw error;
  return data.map(mapRecord);
}

export async function getTodayRecord(actionId: string, date: string) {
  const { data, error } = await supabase
    .from(TABLES.WORKOUT_RECORDS)
    .select("*")
    .eq("action_id", actionId)
    .eq("date", date)
    .maybeSingle();

  if (error && error.code !== "PGRST116") throw error;
  return data ? mapRecord(data) : undefined;
}

export async function upsertRecord(
  actionId: string,
  date: string,
  sets: number,
  reps: number = 0
) {
  // 先查是否存在
  const existing = await getTodayRecord(actionId, date);

  if (existing) {
    const { data, error } = await supabase
      .from(TABLES.WORKOUT_RECORDS)
      .update({ sets, reps })
      .eq("id", existing.id)
      .select()
      .single();

    if (error) throw error;
    return mapRecord(data);
  }

  const { data, error } = await supabase
    .from(TABLES.WORKOUT_RECORDS)
    .insert({
      id: generateId(),
      action_id: actionId,
      date,
      sets,
      reps,
    })
    .select()
    .single();

  if (error) throw error;
  return mapRecord(data);
}

export async function deleteRecord(actionId: string, date: string): Promise<boolean> {
  const { error } = await supabase
    .from(TABLES.WORKOUT_RECORDS)
    .delete()
    .eq("action_id", actionId)
    .eq("date", date);

  return !error;
}

export async function getRecordsByDate(date: string) {
  const { data, error } = await supabase
    .from(TABLES.WORKOUT_RECORDS)
    .select("*, actions!inner(name)")
    .eq("date", date);

  if (error) throw error;
  return data.map((r: Record<string, unknown>) => ({
    ...mapRecord(r),
    actionName: (r.actions as { name: string })?.name ?? "未知动作",
  }));
}

export async function getAllRecords() {
  const { data, error } = await supabase
    .from(TABLES.WORKOUT_RECORDS)
    .select("*");

  if (error) throw error;
  return data.map(mapRecord);
}

export async function getActionTotalSets(actionId: string): Promise<number> {
  const { data, error } = await supabase
    .from(TABLES.WORKOUT_RECORDS)
    .select("sets")
    .eq("action_id", actionId);

  if (error) throw error;
  return data.reduce((sum: number, r: { sets: number }) => sum + r.sets, 0);
}

export async function getActionTotalReps(actionId: string): Promise<number> {
  const { data, error } = await supabase
    .from(TABLES.WORKOUT_RECORDS)
    .select("reps")
    .eq("action_id", actionId);

  if (error) throw error;
  return data.reduce((sum: number, r: { reps: number }) => sum + r.reps, 0);
}

export async function getLastWorkoutBefore(actionId: string, date: string) {
  const { data, error } = await supabase
    .from(TABLES.WORKOUT_RECORDS)
    .select("*")
    .eq("action_id", actionId)
    .lt("date", date)
    .order("date", { ascending: false })
    .limit(1);

  if (error) throw error;
  return data[0] ? mapRecord(data[0]) : undefined;
}

export async function getActionYearRecords(actionId: string, year: number) {
  const { data, error } = await supabase
    .from(TABLES.WORKOUT_RECORDS)
    .select("*")
    .eq("action_id", actionId)
    .gte("date", `${year}-01-01`)
    .lte("date", `${year}-12-31`);

  if (error) throw error;
  return data.map(mapRecord);
}

// ========== Body Metrics API ==========

export async function getBodyMetrics() {
  const { data, error } = await supabase
    .from(TABLES.BODY_METRICS)
    .select("*")
    .order("date", { ascending: false });

  if (error) throw error;
  return data.map(mapBodyMetric);
}

export async function upsertBodyMetric(input: {
  date: string;
  weight?: number | null;
  height?: number | null;
  note?: string | null;
}) {
  const existing = await getBodyMetricByDate(input.date);

  if (existing) {
    const updates: Record<string, unknown> = {};
    if (input.weight !== undefined) updates.weight = input.weight;
    if (input.height !== undefined) updates.height = input.height;
    if (input.note !== undefined) updates.note = input.note;

    const { data, error } = await supabase
      .from(TABLES.BODY_METRICS)
      .update(updates)
      .eq("id", existing.id)
      .select()
      .single();

    if (error) throw error;
    return mapBodyMetric(data);
  }

  const { data, error } = await supabase
    .from(TABLES.BODY_METRICS)
    .insert({
      id: generateId(),
      date: input.date,
      weight: input.weight ?? null,
      height: input.height ?? null,
      note: input.note ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return mapBodyMetric(data);
}

export async function updateBodyMetric(
  id: string,
  input: { weight?: number | null; height?: number | null; note?: string | null }
) {
  const updates: Record<string, unknown> = {};
  if (input.weight !== undefined) updates.weight = input.weight;
  if (input.height !== undefined) updates.height = input.height;
  if (input.note !== undefined) updates.note = input.note;

  const { data, error } = await supabase
    .from(TABLES.BODY_METRICS)
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data ? mapBodyMetric(data) : null;
}

export async function deleteBodyMetric(id: string): Promise<boolean> {
  const { error } = await supabase
    .from(TABLES.BODY_METRICS)
    .delete()
    .eq("id", id);

  return !error;
}

async function getBodyMetricByDate(date: string) {
  const { data, error } = await supabase
    .from(TABLES.BODY_METRICS)
    .select("*")
    .eq("date", date)
    .maybeSingle();

  if (error && error.code !== "PGRST116") throw error;
  return data ? mapBodyMetric(data) : undefined;
}

// ========== 映射函数：db 字段 → 前端字段 ==========

function mapAction(row: Record<string, unknown>) {
  return {
    id: row.id as string,
    name: row.name as string,
    sortOrder: row.sort_order as number,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function mapRecord(row: Record<string, unknown>) {
  return {
    id: row.id as string,
    actionId: row.action_id as string,
    date: row.date as string,
    sets: row.sets as number,
    reps: row.reps as number,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function mapBodyMetric(row: Record<string, unknown>) {
  return {
    id: row.id as string,
    date: row.date as string,
    weight: row.weight as number | null,
    height: row.height as number | null,
    note: row.note as string | null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

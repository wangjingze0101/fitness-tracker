/**
 * Vercel Postgres 数据库存储层
 * 部署到 Vercel 后自动使用，首次请求自动建表
 */

import { sql } from "@vercel/postgres";

// ========== 自动建表（首次使用自动执行） ==========

let tablesReady = false;

async function ensureTables() {
  if (tablesReady) return;
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS actions (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS workout_records (
        id TEXT PRIMARY KEY,
        action_id TEXT NOT NULL REFERENCES actions(id) ON DELETE CASCADE,
        date TEXT NOT NULL,
        sets INTEGER DEFAULT 0,
        reps INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(action_id, date)
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS body_metrics (
        id TEXT PRIMARY KEY,
        date TEXT NOT NULL UNIQUE,
        weight REAL,
        height REAL,
        note TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    tablesReady = true;
  } catch (err) {
    console.error("建表失败:", err);
  }
}

// ========== ID 生成 ==========

function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

// ========== Actions ==========

export async function getActions() {
  await ensureTables();
  const { rows } = await sql`SELECT * FROM actions ORDER BY sort_order ASC`;
  return rows.map(mapAction);
}

export async function getActionById(id: string) {
  await ensureTables();
  const { rows } = await sql`SELECT * FROM actions WHERE id = ${id}`;
  return rows[0] ? mapAction(rows[0]) : undefined;
}

export async function createAction(name: string) {
  await ensureTables();
  const { rows: existing } = await sql`SELECT sort_order FROM actions ORDER BY sort_order DESC LIMIT 1`;
  const sortOrder = (existing[0]?.sort_order ?? -1) + 1;
  const id = genId();
  const { rows } = await sql`
    INSERT INTO actions (id, name, sort_order) VALUES (${id}, ${name.trim()}, ${sortOrder})
    RETURNING *
  `;
  return mapAction(rows[0]);
}

export async function updateAction(id: string, name: string) {
  await ensureTables();
  const { rows } = await sql`
    UPDATE actions SET name = ${name.trim()} WHERE id = ${id} RETURNING *
  `;
  return rows[0] ? mapAction(rows[0]) : null;
}

export async function deleteAction(id: string): Promise<boolean> {
  await ensureTables();
  const { rowCount } = await sql`DELETE FROM actions WHERE id = ${id}`;
  return (rowCount ?? 0) > 0;
}

export async function reorderActions(orderedIds: string[]) {
  await ensureTables();
  for (let i = 0; i < orderedIds.length; i++) {
    await sql`UPDATE actions SET sort_order = ${i} WHERE id = ${orderedIds[i]}`;
  }
  return true;
}

// ========== Workout Records ==========

export async function getRecordsByAction(actionId: string) {
  await ensureTables();
  const { rows } = await sql`
    SELECT * FROM workout_records WHERE action_id = ${actionId} ORDER BY date DESC
  `;
  return rows.map(mapRecord);
}

export async function getTodayRecord(actionId: string, date: string) {
  await ensureTables();
  const { rows } = await sql`
    SELECT * FROM workout_records WHERE action_id = ${actionId} AND date = ${date}
  `;
  return rows[0] ? mapRecord(rows[0]) : undefined;
}

export async function upsertRecord(actionId: string, date: string, sets: number, reps = 0) {
  await ensureTables();
  const existing = await getTodayRecord(actionId, date);
  if (existing) {
    const { rows } = await sql`
      UPDATE workout_records SET sets = ${sets}, reps = ${reps} WHERE id = ${existing.id} RETURNING *
    `;
    return mapRecord(rows[0]);
  }
  const { rows } = await sql`
    INSERT INTO workout_records (id, action_id, date, sets, reps)
    VALUES (${genId()}, ${actionId}, ${date}, ${sets}, ${reps})
    RETURNING *
  `;
  return mapRecord(rows[0]);
}

export async function deleteRecord(actionId: string, date: string): Promise<boolean> {
  await ensureTables();
  const { rowCount } = await sql`
    DELETE FROM workout_records WHERE action_id = ${actionId} AND date = ${date}
  `;
  return (rowCount ?? 0) > 0;
}

export async function getRecordsByDate(date: string) {
  await ensureTables();
  const { rows } = await sql`
    SELECT wr.*, a.name as action_name FROM workout_records wr
    JOIN actions a ON wr.action_id = a.id
    WHERE wr.date = ${date}
  `;
  return rows.map((r) => ({
    ...mapRecord(r),
    actionName: r.action_name as string,
  }));
}

export async function getAllRecords() {
  await ensureTables();
  const { rows } = await sql`SELECT * FROM workout_records`;
  return rows.map(mapRecord);
}

export async function getActionTotalSets(actionId: string): Promise<number> {
  await ensureTables();
  const { rows } = await sql`
    SELECT COALESCE(SUM(sets), 0) as total FROM workout_records WHERE action_id = ${actionId}
  `;
  return parseInt(rows[0]?.total as string) || 0;
}

export async function getActionTotalReps(actionId: string): Promise<number> {
  await ensureTables();
  const { rows } = await sql`
    SELECT COALESCE(SUM(reps), 0) as total FROM workout_records WHERE action_id = ${actionId}
  `;
  return parseInt(rows[0]?.total as string) || 0;
}

export async function getLastWorkoutBefore(actionId: string, date: string) {
  await ensureTables();
  const { rows } = await sql`
    SELECT * FROM workout_records
    WHERE action_id = ${actionId} AND date < ${date}
    ORDER BY date DESC LIMIT 1
  `;
  return rows[0] ? mapRecord(rows[0]) : undefined;
}

export async function getActionYearRecords(actionId: string, year: number) {
  await ensureTables();
  const { rows } = await sql`
    SELECT * FROM workout_records
    WHERE action_id = ${actionId} AND date >= ${`${year}-01-01`} AND date <= ${`${year}-12-31`}
  `;
  return rows.map(mapRecord);
}

// ========== Body Metrics ==========

export async function getBodyMetrics() {
  await ensureTables();
  const { rows } = await sql`SELECT * FROM body_metrics ORDER BY date DESC`;
  return rows.map(mapBody);
}

export async function upsertBodyMetric(input: {
  date: string;
  weight?: number | null;
  height?: number | null;
  note?: string | null;
}) {
  await ensureTables();
  const { rows: existing } = await sql`SELECT * FROM body_metrics WHERE date = ${input.date}`;
  if (existing[0]) {
    const { rows } = await sql`
      UPDATE body_metrics
      SET weight = COALESCE(${input.weight ?? null}, weight),
          height = COALESCE(${input.height ?? null}, height),
          note = COALESCE(${input.note ?? null}, note)
      WHERE id = ${existing[0].id as string}
      RETURNING *
    `;
    return mapBody(rows[0]);
  }
  const { rows } = await sql`
    INSERT INTO body_metrics (id, date, weight, height, note)
    VALUES (${genId()}, ${input.date}, ${input.weight ?? null}, ${input.height ?? null}, ${input.note ?? null})
    RETURNING *
  `;
  return mapBody(rows[0]);
}

export async function updateBodyMetric(
  id: string,
  input: { weight?: number | null; height?: number | null; note?: string | null }
) {
  await ensureTables();
  const { rows } = await sql`
    UPDATE body_metrics
    SET weight = COALESCE(${input.weight ?? null}, weight),
        height = COALESCE(${input.height ?? null}, height),
        note = COALESCE(${input.note ?? null}, note)
    WHERE id = ${id}
    RETURNING *
  `;
  return rows[0] ? mapBody(rows[0]) : null;
}

export async function deleteBodyMetric(id: string): Promise<boolean> {
  await ensureTables();
  const { rowCount } = await sql`DELETE FROM body_metrics WHERE id = ${id}`;
  return (rowCount ?? 0) > 0;
}

// ========== 字段映射 ==========

function mapAction(r: Record<string, unknown>) {
  return {
    id: r.id as string, name: r.name as string,
    sortOrder: r.sort_order as number,
    createdAt: String(r.created_at ?? ""),
    updatedAt: String(r.updated_at ?? ""),
  };
}

function mapRecord(r: Record<string, unknown>) {
  return {
    id: r.id as string, actionId: r.action_id as string,
    date: r.date as string, sets: r.sets as number, reps: r.reps as number,
    createdAt: String(r.created_at ?? ""),
    updatedAt: String(r.updated_at ?? ""),
  };
}

function mapBody(r: Record<string, unknown>) {
  return {
    id: r.id as string, date: r.date as string,
    weight: r.weight as number | null, height: r.height as number | null,
    note: r.note as string | null,
    createdAt: String(r.created_at ?? ""),
    updatedAt: String(r.updated_at ?? ""),
  };
}

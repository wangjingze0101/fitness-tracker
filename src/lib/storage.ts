/**
 * Vercel Postgres 数据库存储层（多用户版）
 * 所有数据按 user_id 隔离
 */

import { sql } from "@vercel/postgres";

let tablesReady = false;

async function ensureTables() {
  if (tablesReady) return;
  try {
    // 删除旧表（无 user_id 的旧版本）
    await sql`DROP TABLE IF EXISTS workout_records CASCADE`;
    await sql`DROP TABLE IF EXISTS actions CASCADE`;
    await sql`DROP TABLE IF EXISTS body_metrics CASCADE`;
    await sql`DROP TABLE IF EXISTS users CASCADE`;

    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        name TEXT DEFAULT '',
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS actions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id, name)
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS workout_records (
        id TEXT PRIMARY KEY,
        action_id TEXT NOT NULL REFERENCES actions(id) ON DELETE CASCADE,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        date TEXT NOT NULL,
        weight REAL,
        height REAL,
        note TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id, date)
      )
    `;
    tablesReady = true;
  } catch (err) {
    console.error("建表失败:", err);
  }
}

function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

// ========== Users ==========

export async function createUser(email: string, passwordHash: string, name: string) {
  await ensureTables();
  const id = genId();
  const { rows } = await sql`
    INSERT INTO users (id, email, password_hash, name) VALUES (${id}, ${email}, ${passwordHash}, ${name})
    RETURNING id, email, name, created_at
  `;
  return { id: rows[0].id as string, email: rows[0].email as string, name: rows[0].name as string };
}

export async function getUserByEmail(email: string) {
  await ensureTables();
  const { rows } = await sql`SELECT * FROM users WHERE email = ${email}`;
  return rows[0] ? { id: rows[0].id as string, email: rows[0].email as string, password_hash: rows[0].password_hash as string, name: rows[0].name as string } : undefined;
}

export async function getUserById(id: string) {
  await ensureTables();
  const { rows } = await sql`SELECT id, email, name FROM users WHERE id = ${id}`;
  return rows[0] ? { id: rows[0].id as string, email: rows[0].email as string, name: rows[0].name as string } : undefined;
}

// ========== Actions ==========

export async function getActions(userId: string) {
  await ensureTables();
  const { rows } = await sql`SELECT * FROM actions WHERE user_id = ${userId} ORDER BY sort_order ASC`;
  return rows.map(mapAction);
}

export async function getActionById(userId: string, id: string) {
  await ensureTables();
  const { rows } = await sql`SELECT * FROM actions WHERE id = ${id} AND user_id = ${userId}`;
  return rows[0] ? mapAction(rows[0]) : undefined;
}

export async function createAction(userId: string, name: string) {
  await ensureTables();
  const { rows: existing } = await sql`SELECT sort_order FROM actions WHERE user_id = ${userId} ORDER BY sort_order DESC LIMIT 1`;
  const sortOrder = (existing[0]?.sort_order ?? -1) + 1;
  const id = genId();
  const { rows } = await sql`
    INSERT INTO actions (id, user_id, name, sort_order) VALUES (${id}, ${userId}, ${name.trim()}, ${sortOrder}) RETURNING *
  `;
  return mapAction(rows[0]);
}

export async function updateAction(userId: string, id: string, name: string) {
  await ensureTables();
  const { rows } = await sql`UPDATE actions SET name = ${name.trim()} WHERE id = ${id} AND user_id = ${userId} RETURNING *`;
  return rows[0] ? mapAction(rows[0]) : null;
}

export async function deleteAction(userId: string, id: string): Promise<boolean> {
  await ensureTables();
  const { rowCount } = await sql`DELETE FROM actions WHERE id = ${id} AND user_id = ${userId}`;
  return (rowCount ?? 0) > 0;
}

export async function reorderActions(userId: string, orderedIds: string[]) {
  await ensureTables();
  for (let i = 0; i < orderedIds.length; i++) {
    await sql`UPDATE actions SET sort_order = ${i} WHERE id = ${orderedIds[i]} AND user_id = ${userId}`;
  }
  return true;
}

// ========== Records ==========

export async function getRecordsByAction(userId: string, actionId: string) {
  await ensureTables();
  const { rows } = await sql`SELECT * FROM workout_records WHERE action_id = ${actionId} AND user_id = ${userId} ORDER BY date DESC`;
  return rows.map(mapRecord);
}

export async function getTodayRecord(userId: string, actionId: string, date: string) {
  await ensureTables();
  const { rows } = await sql`SELECT * FROM workout_records WHERE action_id = ${actionId} AND user_id = ${userId} AND date = ${date}`;
  return rows[0] ? mapRecord(rows[0]) : undefined;
}

export async function upsertRecord(userId: string, actionId: string, date: string, sets: number, reps = 0) {
  await ensureTables();
  const existing = await getTodayRecord(userId, actionId, date);
  if (existing) {
    const { rows } = await sql`UPDATE workout_records SET sets = ${sets}, reps = ${reps} WHERE id = ${existing.id} AND user_id = ${userId} RETURNING *`;
    return mapRecord(rows[0]);
  }
  const { rows } = await sql`
    INSERT INTO workout_records (id, action_id, user_id, date, sets, reps)
    VALUES (${genId()}, ${actionId}, ${userId}, ${date}, ${sets}, ${reps}) RETURNING *
  `;
  return mapRecord(rows[0]);
}

export async function deleteRecord(userId: string, actionId: string, date: string): Promise<boolean> {
  await ensureTables();
  const { rowCount } = await sql`DELETE FROM workout_records WHERE action_id = ${actionId} AND user_id = ${userId} AND date = ${date}`;
  return (rowCount ?? 0) > 0;
}

export async function getRecordsByDate(userId: string, date: string) {
  await ensureTables();
  const { rows } = await sql`
    SELECT wr.*, a.name as action_name FROM workout_records wr
    JOIN actions a ON wr.action_id = a.id
    WHERE wr.user_id = ${userId} AND wr.date = ${date}
  `;
  return rows.map((r) => ({ ...mapRecord(r), actionName: r.action_name as string }));
}

export async function getAllRecords(userId: string) {
  await ensureTables();
  const { rows } = await sql`SELECT * FROM workout_records WHERE user_id = ${userId}`;
  return rows.map(mapRecord);
}

export async function getActionTotalSets(userId: string, actionId: string): Promise<number> {
  await ensureTables();
  const { rows } = await sql`SELECT COALESCE(SUM(sets), 0) as total FROM workout_records WHERE action_id = ${actionId} AND user_id = ${userId}`;
  return parseInt(rows[0]?.total as string) || 0;
}

export async function getActionTotalReps(userId: string, actionId: string): Promise<number> {
  await ensureTables();
  const { rows } = await sql`SELECT COALESCE(SUM(reps), 0) as total FROM workout_records WHERE action_id = ${actionId} AND user_id = ${userId}`;
  return parseInt(rows[0]?.total as string) || 0;
}

export async function getLastWorkoutBefore(userId: string, actionId: string, date: string) {
  await ensureTables();
  const { rows } = await sql`
    SELECT * FROM workout_records WHERE action_id = ${actionId} AND user_id = ${userId} AND date < ${date}
    ORDER BY date DESC LIMIT 1
  `;
  return rows[0] ? mapRecord(rows[0]) : undefined;
}

export async function getActionYearRecords(userId: string, actionId: string, year: number) {
  await ensureTables();
  const { rows } = await sql`
    SELECT * FROM workout_records
    WHERE action_id = ${actionId} AND user_id = ${userId} AND date >= ${`${year}-01-01`} AND date <= ${`${year}-12-31`}
  `;
  return rows.map(mapRecord);
}

// ========== Body Metrics ==========

export async function getBodyMetrics(userId: string) {
  await ensureTables();
  const { rows } = await sql`SELECT * FROM body_metrics WHERE user_id = ${userId} ORDER BY date DESC`;
  return rows.map(mapBody);
}

export async function upsertBodyMetric(userId: string, input: { date: string; weight?: number | null; height?: number | null; note?: string | null }) {
  await ensureTables();
  const { rows: existing } = await sql`SELECT * FROM body_metrics WHERE date = ${input.date} AND user_id = ${userId}`;
  if (existing[0]) {
    const { rows } = await sql`
      UPDATE body_metrics
      SET weight = COALESCE(${input.weight ?? null}, weight),
          height = COALESCE(${input.height ?? null}, height),
          note = COALESCE(${input.note ?? null}, note)
      WHERE id = ${existing[0].id as string} AND user_id = ${userId} RETURNING *
    `;
    return mapBody(rows[0]);
  }
  const { rows } = await sql`
    INSERT INTO body_metrics (id, user_id, date, weight, height, note)
    VALUES (${genId()}, ${userId}, ${input.date}, ${input.weight ?? null}, ${input.height ?? null}, ${input.note ?? null}) RETURNING *
  `;
  return mapBody(rows[0]);
}

export async function updateBodyMetric(userId: string, id: string, input: { weight?: number | null; height?: number | null; note?: string | null }) {
  await ensureTables();
  const { rows } = await sql`
    UPDATE body_metrics
    SET weight = COALESCE(${input.weight ?? null}, weight),
        height = COALESCE(${input.height ?? null}, height),
        note = COALESCE(${input.note ?? null}, note)
    WHERE id = ${id} AND user_id = ${userId} RETURNING *
  `;
  return rows[0] ? mapBody(rows[0]) : null;
}

export async function deleteBodyMetric(userId: string, id: string): Promise<boolean> {
  await ensureTables();
  const { rowCount } = await sql`DELETE FROM body_metrics WHERE id = ${id} AND user_id = ${userId}`;
  return (rowCount ?? 0) > 0;
}

// ========== 映射 ==========

function mapAction(r: Record<string, unknown>) {
  return { id: r.id as string, name: r.name as string, sortOrder: r.sort_order as number, createdAt: String(r.created_at ?? ""), updatedAt: String(r.updated_at ?? "") };
}
function mapRecord(r: Record<string, unknown>) {
  return { id: r.id as string, actionId: r.action_id as string, date: r.date as string, sets: r.sets as number, reps: r.reps as number, createdAt: String(r.created_at ?? ""), updatedAt: String(r.updated_at ?? "") };
}
function mapBody(r: Record<string, unknown>) {
  return { id: r.id as string, date: r.date as string, weight: r.weight as number | null, height: r.height as number | null, note: r.note as string | null, createdAt: String(r.created_at ?? ""), updatedAt: String(r.updated_at ?? "") };
}

import { sql } from "@vercel/postgres";

/** 检查邮箱是否为管理员 */
export function isAdminEmail(email: string): boolean {
  const adminEmail = process.env.ADMIN_EMAIL || "";
  return adminEmail === email;
}

/** 获取所有用户 */
export async function getAllUsers() {
  const { rows } = await sql`SELECT id, email, name, created_at FROM users ORDER BY created_at DESC`;
  return rows.map(r => ({ id: r.id, email: r.email, name: r.name, createdAt: r.created_at }));
}

/** 获取某用户的动作数、总组数 */
export async function getUserStats(userId: string) {
  const { rows: a } = await sql`SELECT COUNT(*)::int as count FROM actions WHERE user_id = ${userId}`;
  const { rows: r } = await sql`SELECT COUNT(*)::int as count, COALESCE(SUM(sets),0)::int as total FROM workout_records WHERE user_id = ${userId}`;
  const { rows: b } = await sql`SELECT COUNT(*)::int as count FROM body_metrics WHERE user_id = ${userId}`;
  return { actions: a[0].count, records: r[0].count, totalSets: r[0].total, bodyMetrics: b[0].count };
}

/** 获取某用户的动作列表 */
export async function getUserActions(userId: string) {
  const { rows } = await sql`SELECT * FROM actions WHERE user_id = ${userId} ORDER BY sort_order`;
  return rows.map(r => ({ id: r.id, name: r.name, sortOrder: r.sort_order }));
}

/** 获取某用户的训练记录 */
export async function getUserRecords(userId: string) {
  const { rows } = await sql`
    SELECT wr.*, a.name as action_name FROM workout_records wr
    JOIN actions a ON wr.action_id = a.id
    WHERE wr.user_id = ${userId}
    ORDER BY wr.date DESC LIMIT 100
  `;
  return rows.map(r => ({ id: r.id, actionName: r.action_name, date: r.date, sets: r.sets, reps: r.reps }));
}

import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth";
import { sql } from "@vercel/postgres";

// GET /api/auth/profile
export async function GET(req: NextRequest) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: "请先登录" }, { status: 401 });
  try {
    const { rows } = await sql`SELECT id, email, name FROM users WHERE id = ${userId}`;
    return NextResponse.json({ user: rows[0] || null });
  } catch { return NextResponse.json({ error: "获取失败" }, { status: 500 }); }
}

// PUT /api/auth/profile — 修改昵称
export async function PUT(req: NextRequest) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: "请先登录" }, { status: 401 });
  try {
    const { name } = await req.json();
    if (!name?.trim()) return NextResponse.json({ error: "昵称不能为空" }, { status: 400 });
    const { rows } = await sql`
      UPDATE users SET name = ${name.trim()} WHERE id = ${userId} RETURNING id, email, name
    `;
    return NextResponse.json({ user: rows[0] });
  } catch { return NextResponse.json({ error: "修改失败" }, { status: 500 }); }
}

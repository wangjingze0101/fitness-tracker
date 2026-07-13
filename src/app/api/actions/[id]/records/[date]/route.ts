import { NextRequest, NextResponse } from "next/server";
import * as storage from "@/lib/storage";
import { getUserIdFromRequest } from "@/lib/auth";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string; date: string }> }) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: "请先登录" }, { status: 401 });
  try {
    const { id, date } = await params;
    const { sets, reps } = await req.json();
    const log = await storage.upsertRecord(userId, id, date, sets ?? 0, reps ?? 0);
    return NextResponse.json({ log });
  } catch (e) { console.error(e); return NextResponse.json({ error: "更新失败" }, { status: 500 }); }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string; date: string }> }) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: "请先登录" }, { status: 401 });
  try {
    const { id, date } = await params;
    const ok = await storage.deleteRecord(userId, id, date);
    if (!ok) return NextResponse.json({ error: "记录不存在" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (e) { console.error(e); return NextResponse.json({ error: "删除失败" }, { status: 500 }); }
}

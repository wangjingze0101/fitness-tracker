import { NextRequest, NextResponse } from "next/server";
import * as storage from "@/lib/storage";
import { getUserIdFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: "请先登录" }, { status: 401 });
  try {
    const { id } = await params;
    const records = await storage.getRecordsByAction(userId, id);
    return NextResponse.json({ records });
  } catch (e) { console.error(e); return NextResponse.json({ error: "获取失败" }, { status: 500 }); }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: "请先登录" }, { status: 401 });
  try {
    const { id } = await params;
    const { date, sets, reps } = await req.json();
    if (!date) return NextResponse.json({ error: "日期不能为空" }, { status: 400 });
    const log = await storage.upsertRecord(userId, id, date, sets ?? 0, reps ?? 0);
    return NextResponse.json({ log });
  } catch (e) { console.error(e); return NextResponse.json({ error: "更新失败" }, { status: 500 }); }
}

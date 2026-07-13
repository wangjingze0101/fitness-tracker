import { NextRequest, NextResponse } from "next/server";
import * as storage from "@/lib/storage";
import { getUserIdFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ date: string }> }) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: "请先登录" }, { status: 401 });
  try {
    const { date } = await params;
    const records = await storage.getRecordsByDate(userId, date);
    return NextResponse.json({ date, records: records.map(r => ({ actionId: r.actionId, actionName: r.actionName, sets: r.sets, reps: r.reps })), totalSets: records.reduce((s,r) => s + r.sets, 0) });
  } catch (e) { console.error(e); return NextResponse.json({ error: "获取失败" }, { status: 500 }); }
}

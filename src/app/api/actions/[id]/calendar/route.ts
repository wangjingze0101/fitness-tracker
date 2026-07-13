import { NextRequest, NextResponse } from "next/server";
import * as storage from "@/lib/storage";
import { getUserIdFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: "请先登录" }, { status: 401 });
  try {
    const { id } = await params;
    const year = parseInt(new URL(req.url).searchParams.get("year") || String(new Date().getFullYear()));
    const action = await storage.getActionById(userId, id);
    if (!action) return NextResponse.json({ error: "动作不存在" }, { status: 404 });
    const records = await storage.getActionYearRecords(userId, id, year);
    const recordMap = new Map(records.map((r) => [r.date, r]));
    const days = [];
    for (let d = new Date(year, 0, 1); d.getFullYear() === year; d.setDate(d.getDate() + 1)) {
      const ds = d.toISOString().slice(0, 10);
      const r = recordMap.get(ds);
      days.push({ date: ds, sets: r?.sets ?? 0, reps: r?.reps ?? 0, level: getLevel(r?.sets ?? 0) });
    }
    return NextResponse.json({ actionId: id, actionName: action.name, year, days });
  } catch (e) { console.error(e); return NextResponse.json({ error: "获取失败" }, { status: 500 }); }
}
function getLevel(s: number): 0|1|2|3|4 { if (s===0) return 0; if (s<=3) return 1; if (s<=7) return 2; if (s<=15) return 3; return 4; }

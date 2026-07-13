import { NextRequest, NextResponse } from "next/server";
import * as storage from "@/lib/storage";
import { getUserIdFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "请先登录" }, { status: 401 });
  try {
    const year = parseInt(new URL(request.url).searchParams.get("year") || String(new Date().getFullYear()));
    const allRecords = await storage.getAllRecords(userId);
    const dateMap = new Map<string, number>();
    for (const r of allRecords) dateMap.set(r.date, (dateMap.get(r.date) ?? 0) + r.sets);

    const days = [];
    for (let d = new Date(year, 0, 1); d.getFullYear() === year; d.setDate(d.getDate() + 1)) {
      const ds = d.toISOString().slice(0, 10);
      const ts = dateMap.get(ds) ?? 0;
      days.push({ date: ds, totalSets: ts, level: getLevel(ts) });
    }
    return NextResponse.json({ year, days });
  } catch (e) { console.error(e); return NextResponse.json({ error: "获取失败" }, { status: 500 }); }
}
function getLevel(s: number): 0|1|2|3|4 { if (s===0) return 0; if (s<=3) return 1; if (s<=7) return 2; if (s<=15) return 3; return 4; }

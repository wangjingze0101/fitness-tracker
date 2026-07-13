import { NextRequest, NextResponse } from "next/server";
import * as storage from "@/lib/storage";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()));

    const allRecords = await storage.getAllRecords();
    const dateMap = new Map<string, number>();
    for (const r of allRecords) {
      dateMap.set(r.date, (dateMap.get(r.date) ?? 0) + r.sets);
    }

    const days = [];
    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().slice(0, 10);
      const totalSets = dateMap.get(dateStr) ?? 0;
      days.push({ date: dateStr, totalSets, level: getLevel(totalSets) });
    }

    return NextResponse.json({ year, days });
  } catch (error) {
    console.error("获取日历数据失败:", error);
    return NextResponse.json({ error: "获取日历数据失败" }, { status: 500 });
  }
}

function getLevel(sets: number): 0 | 1 | 2 | 3 | 4 {
  if (sets === 0) return 0;
  if (sets <= 3) return 1;
  if (sets <= 7) return 2;
  if (sets <= 15) return 3;
  return 4;
}

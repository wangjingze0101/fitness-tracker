import { NextRequest, NextResponse } from "next/server";
import * as storage from "@/lib/storage";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()));

    const action = await storage.getActionById(id);
    if (!action) return NextResponse.json({ error: "动作不存在" }, { status: 404 });

    const records = await storage.getActionYearRecords(id, year);
    const recordMap = new Map(records.map((r) => [r.date, r]));

    const days = [];
    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().slice(0, 10);
      const record = recordMap.get(dateStr);
      days.push({
        date: dateStr,
        sets: record?.sets ?? 0,
        reps: record?.reps ?? 0,
        level: getLevel(record?.sets ?? 0),
      });
    }

    return NextResponse.json({ actionId: id, actionName: action.name, year, days });
  } catch (error) {
    console.error("获取动作日历失败:", error);
    return NextResponse.json({ error: "获取动作日历失败" }, { status: 500 });
  }
}

function getLevel(sets: number): 0 | 1 | 2 | 3 | 4 {
  if (sets === 0) return 0;
  if (sets <= 3) return 1;
  if (sets <= 7) return 2;
  if (sets <= 15) return 3;
  return 4;
}

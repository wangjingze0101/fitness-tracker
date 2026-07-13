import { NextRequest, NextResponse } from "next/server";
import * as storage from "@/lib/storage";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ date: string }> }
) {
  try {
    const { date } = await params;
    const records = await storage.getRecordsByDate(date);
    const totalSets = records.reduce((sum, r) => sum + r.sets, 0);
    return NextResponse.json({
      date,
      records: records.map((r) => ({ actionId: r.actionId, actionName: r.actionName, sets: r.sets, reps: r.reps })),
      totalSets,
    });
  } catch (error) {
    console.error("获取日期详情失败:", error);
    return NextResponse.json({ error: "获取日期详情失败" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import * as storage from "@/lib/storage";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const records = await storage.getRecordsByAction(id);
    return NextResponse.json({ records });
  } catch (error) {
    console.error("获取历史记录失败:", error);
    return NextResponse.json({ error: "获取历史记录失败" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { date, sets, reps } = await request.json();
    if (!date) return NextResponse.json({ error: "日期不能为空" }, { status: 400 });
    const log = await storage.upsertRecord(id, date, sets ?? 0, reps ?? 0);
    return NextResponse.json({ log });
  } catch (error) {
    console.error("更新训练记录失败:", error);
    return NextResponse.json({ error: "更新训练记录失败" }, { status: 500 });
  }
}

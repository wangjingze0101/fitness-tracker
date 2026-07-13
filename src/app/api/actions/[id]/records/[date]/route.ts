import { NextRequest, NextResponse } from "next/server";
import * as storage from "@/lib/storage";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; date: string }> }
) {
  try {
    const { id, date } = await params;
    const { sets, reps } = await request.json();
    const log = await storage.upsertRecord(id, date, sets ?? 0, reps ?? 0);
    return NextResponse.json({ log });
  } catch (error) {
    console.error("更新训练记录失败:", error);
    return NextResponse.json({ error: "更新训练记录失败" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; date: string }> }
) {
  try {
    const { id, date } = await params;
    const ok = await storage.deleteRecord(id, date);
    if (!ok) return NextResponse.json({ error: "记录不存在" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("删除训练记录失败:", error);
    return NextResponse.json({ error: "删除训练记录失败" }, { status: 500 });
  }
}

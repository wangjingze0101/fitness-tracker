import { NextRequest, NextResponse } from "next/server";
import * as storage from "@/lib/storage";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { name } = await request.json();
    if (!name || !name.trim()) {
      return NextResponse.json({ error: "动作名称不能为空" }, { status: 400 });
    }
    const action = await storage.updateAction(id, name);
    if (!action) return NextResponse.json({ error: "动作不存在" }, { status: 404 });
    return NextResponse.json({ action });
  } catch (error) {
    console.error("更新动作失败:", error);
    return NextResponse.json({ error: "更新动作失败" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ok = await storage.deleteAction(id);
    if (!ok) return NextResponse.json({ error: "动作不存在" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("删除动作失败:", error);
    return NextResponse.json({ error: "删除动作失败" }, { status: 500 });
  }
}

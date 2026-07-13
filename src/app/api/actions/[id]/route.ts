import { NextRequest, NextResponse } from "next/server";
import * as storage from "@/lib/storage";
import { getUserIdFromRequest } from "@/lib/auth";

async function getUserId(req: NextRequest) {
  const uid = await getUserIdFromRequest(req);
  if (!uid) throw new Error("unauthorized");
  return uid;
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await getUserId(req);
    const { id } = await params;
    const { name } = await req.json();
    if (!name?.trim()) return NextResponse.json({ error: "动作名称不能为空" }, { status: 400 });
    const action = await storage.updateAction(userId, id, name);
    if (!action) return NextResponse.json({ error: "动作不存在" }, { status: 404 });
    return NextResponse.json({ action });
  } catch (e) { return handleError(e); }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await getUserId(req);
    const { id } = await params;
    const ok = await storage.deleteAction(userId, id);
    if (!ok) return NextResponse.json({ error: "动作不存在" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (e) { return handleError(e); }
}

function handleError(e: unknown) {
  if (e instanceof Error && e.message === "unauthorized") return NextResponse.json({ error: "请先登录" }, { status: 401 });
  console.error(e);
  return NextResponse.json({ error: "操作失败" }, { status: 500 });
}

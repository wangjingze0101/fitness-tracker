import { NextRequest, NextResponse } from "next/server";
import * as storage from "@/lib/storage";
import { getUserIdFromRequest } from "@/lib/auth";

export async function PUT(request: NextRequest) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "请先登录" }, { status: 401 });

  try {
    const { orderedIds } = await request.json();
    if (!Array.isArray(orderedIds)) return NextResponse.json({ error: "orderedIds 必须是数组" }, { status: 400 });
    await storage.reorderActions(userId, orderedIds);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("排序更新失败:", error);
    return NextResponse.json({ error: "排序更新失败" }, { status: 500 });
  }
}

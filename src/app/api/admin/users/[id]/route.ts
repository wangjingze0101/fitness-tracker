import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth";
import { getUserById } from "@/lib/storage";
import { isAdminEmail, getUserActions, getUserRecords } from "@/lib/admin";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const admin = await getUserById(userId);
  if (!admin || !isAdminEmail(admin.email)) return NextResponse.json({ error: "无权限" }, { status: 403 });

  try {
    const { id } = await params;
    const actions = await getUserActions(id);
    const records = await getUserRecords(id);
    return NextResponse.json({ actions, records });
  } catch (e) {
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}

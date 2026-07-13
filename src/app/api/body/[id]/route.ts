import { NextRequest, NextResponse } from "next/server";
import * as storage from "@/lib/storage";
import { getUserIdFromRequest } from "@/lib/auth";
import { calculateBMI } from "@/lib/utils";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: "请先登录" }, { status: 401 });
  try {
    const { id } = await params;
    const { weight, height, note } = await req.json();
    const metric = await storage.updateBodyMetric(userId, id, { weight: weight ?? null, height: height ?? null, note: note ?? null });
    if (!metric) return NextResponse.json({ error: "数据不存在" }, { status: 404 });
    return NextResponse.json({ metric: { ...metric, bmi: calculateBMI(metric.weight, metric.height) } });
  } catch (e) { console.error(e); return NextResponse.json({ error: "更新失败" }, { status: 500 }); }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: "请先登录" }, { status: 401 });
  try {
    const { id } = await params;
    const ok = await storage.deleteBodyMetric(userId, id);
    if (!ok) return NextResponse.json({ error: "数据不存在" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (e) { console.error(e); return NextResponse.json({ error: "删除失败" }, { status: 500 }); }
}

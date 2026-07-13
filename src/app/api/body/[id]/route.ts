import { NextRequest, NextResponse } from "next/server";
import * as storage from "@/lib/storage";
import { calculateBMI } from "@/lib/utils";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { weight, height, note } = await request.json();
    const metric = await storage.updateBodyMetric(id, {
      weight: weight ?? null, height: height ?? null, note: note ?? null,
    });
    if (!metric) return NextResponse.json({ error: "数据不存在" }, { status: 404 });
    return NextResponse.json({
      metric: { ...metric, bmi: calculateBMI(metric.weight, metric.height) },
    });
  } catch (error) {
    console.error("更新身体数据失败:", error);
    return NextResponse.json({ error: "更新身体数据失败" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ok = await storage.deleteBodyMetric(id);
    if (!ok) return NextResponse.json({ error: "数据不存在" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("删除身体数据失败:", error);
    return NextResponse.json({ error: "删除身体数据失败" }, { status: 500 });
  }
}

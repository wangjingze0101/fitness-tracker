import { NextRequest, NextResponse } from "next/server";
import * as storage from "@/lib/storage";
import { calculateBMI } from "@/lib/utils";

export async function GET() {
  try {
    const metrics = await storage.getBodyMetrics();
    return NextResponse.json({
      metrics: metrics.map((m) => ({ ...m, bmi: calculateBMI(m.weight, m.height) })),
    });
  } catch (error) {
    console.error("获取身体数据失败:", error);
    return NextResponse.json({ error: "获取身体数据失败" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { date, weight, height, note } = await request.json();
    if (!date) return NextResponse.json({ error: "日期不能为空" }, { status: 400 });
    const metric = await storage.upsertBodyMetric({
      date, weight: weight ?? null, height: height ?? null, note: note ?? null,
    });
    return NextResponse.json(
      { metric: { ...metric, bmi: calculateBMI(metric.weight, metric.height) } },
      { status: 201 }
    );
  } catch (error) {
    console.error("保存身体数据失败:", error);
    return NextResponse.json({ error: "保存身体数据失败" }, { status: 500 });
  }
}

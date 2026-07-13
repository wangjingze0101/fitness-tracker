import { NextRequest, NextResponse } from "next/server";
import * as storage from "@/lib/storage";
import { getUserIdFromRequest } from "@/lib/auth";
import { calculateBMI } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: "请先登录" }, { status: 401 });
  try {
    const metrics = await storage.getBodyMetrics(userId);
    return NextResponse.json({ metrics: metrics.map(m => ({ ...m, bmi: calculateBMI(m.weight, m.height) })) });
  } catch (e) { console.error(e); return NextResponse.json({ error: "获取失败" }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: "请先登录" }, { status: 401 });
  try {
    const { date, weight, height, note } = await req.json();
    if (!date) return NextResponse.json({ error: "日期不能为空" }, { status: 400 });
    const metric = await storage.upsertBodyMetric(userId, { date, weight: weight ?? null, height: height ?? null, note: note ?? null });
    return NextResponse.json({ metric: { ...metric, bmi: calculateBMI(metric.weight, metric.height) } }, { status: 201 });
  } catch (e) { console.error(e); return NextResponse.json({ error: "保存失败" }, { status: 500 }); }
}

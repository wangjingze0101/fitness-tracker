import { NextRequest, NextResponse } from "next/server";
import * as storage from "@/lib/storage";
import { getUserIdFromRequest } from "@/lib/auth";
import { todayStr } from "@/lib/date";

export async function GET(request: NextRequest) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "请先登录" }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date") || todayStr();
    const actions = await storage.getActions(userId);

    const actionsWithStats = await Promise.all(actions.map(async (action) => {
      const todayRecord = await storage.getTodayRecord(userId, action.id, date);
      const totalSets = await storage.getActionTotalSets(userId, action.id);
      const totalReps = await storage.getActionTotalReps(userId, action.id);
      const lastRecord = await storage.getLastWorkoutBefore(userId, action.id, date);
      return {
        id: action.id, name: action.name, sortOrder: action.sortOrder,
        createdAt: action.createdAt, updatedAt: action.updatedAt,
        todaySets: todayRecord?.sets ?? 0, todayReps: todayRecord?.reps ?? 0,
        totalSets, totalReps,
        lastWorkoutDate: lastRecord?.date ?? null, lastWorkoutSets: lastRecord?.sets ?? null,
        logId: todayRecord?.id ?? null,
      };
    }));

    return NextResponse.json({ date, actions: actionsWithStats, totalSets: actionsWithStats.reduce((s, a) => s + a.todaySets, 0) });
  } catch (error) {
    console.error("获取动作列表失败:", error);
    return NextResponse.json({ error: "获取动作列表失败" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "请先登录" }, { status: 401 });

  try {
    const { name } = await request.json();
    if (!name?.trim()) return NextResponse.json({ error: "动作名称不能为空" }, { status: 400 });
    const action = await storage.createAction(userId, name);
    return NextResponse.json({ action }, { status: 201 });
  } catch (error) {
    console.error("创建动作失败:", error);
    return NextResponse.json({ error: "创建动作失败" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import * as storage from "@/lib/storage";
import { todayStr } from "@/lib/date";

// GET /api/actions?date=YYYY-MM-DD
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date") || todayStr();

    const actions = await storage.getActions();

    const actionsWithStats = await Promise.all(
      actions.map(async (action) => {
        const todayRecord = await storage.getTodayRecord(action.id, date);
        const totalSets = await storage.getActionTotalSets(action.id);
        const totalReps = await storage.getActionTotalReps(action.id);
        const lastRecord = await storage.getLastWorkoutBefore(action.id, date);

        return {
          id: action.id,
          name: action.name,
          sortOrder: action.sortOrder,
          createdAt: action.createdAt,
          updatedAt: action.updatedAt,
          todaySets: todayRecord?.sets ?? 0,
          todayReps: todayRecord?.reps ?? 0,
          totalSets,
          totalReps,
          lastWorkoutDate: lastRecord?.date ?? null,
          lastWorkoutSets: lastRecord?.sets ?? null,
          logId: todayRecord?.id ?? null,
        };
      })
    );

    const todayTotal = actionsWithStats.reduce((sum, a) => sum + a.todaySets, 0);

    return NextResponse.json({ date, actions: actionsWithStats, totalSets: todayTotal });
  } catch (error) {
    console.error("获取动作列表失败:", error);
    return NextResponse.json({ error: "获取动作列表失败" }, { status: 500 });
  }
}

// POST /api/actions
export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();
    if (!name || !name.trim()) {
      return NextResponse.json({ error: "动作名称不能为空" }, { status: 400 });
    }
    const action = await storage.createAction(name);
    return NextResponse.json({ action }, { status: 201 });
  } catch (error) {
    console.error("创建动作失败:", error);
    return NextResponse.json({ error: "创建动作失败" }, { status: 500 });
  }
}

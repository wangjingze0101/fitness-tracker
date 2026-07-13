import { NextRequest, NextResponse } from "next/server";
import * as storage from "@/lib/storage";
import { todayStr, getWeekRange, getMonthRange } from "@/lib/date";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "monthly";
    const today = todayStr();
    const { start: weekStart, end: weekEnd } = getWeekRange();
    const { start: monthStart, end: monthEnd } = getMonthRange();

    const allRecords = await storage.getAllRecords();
    const actions = await storage.getActions();

    const dateMap = new Map<string, number>();
    for (const r of allRecords) {
      dateMap.set(r.date, (dateMap.get(r.date) ?? 0) + r.sets);
    }

    const todaySets = dateMap.get(today) ?? 0;
    let weekSets = 0;
    dateMap.forEach((sets, date) => {
      if (date >= weekStart && date <= weekEnd) weekSets += sets;
    });
    let monthSets = 0;
    dateMap.forEach((sets, date) => {
      if (date >= monthStart && date <= monthEnd) monthSets += sets;
    });
    const totalAllTimeSets = allRecords.reduce((s, r) => s + r.sets, 0);

    let data: { label: string; totalSets: number }[] = [];
    if (period === "daily") {
      for (let i = 6; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        const ds = d.toISOString().slice(0, 10);
        const dayNames = ["日", "一", "二", "三", "四", "五", "六"];
        data.push({ label: `周${dayNames[d.getDay()]}`, totalSets: dateMap.get(ds) ?? 0 });
      }
    } else if (period === "weekly") {
      for (let i = 3; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i * 7);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(d.getFullYear(), d.getMonth(), diff);
        const sunday = new Date(monday); sunday.setDate(sunday.getDate() + 6);
        const ws = monday.toISOString().slice(0, 10);
        const we = sunday.toISOString().slice(0, 10);
        let total = 0;
        dateMap.forEach((sets, date) => { if (date >= ws && date <= we) total += sets; });
        data.push({ label: `${monday.getMonth() + 1}/${monday.getDate()}周`, totalSets: total });
      }
    } else {
      for (let i = 5; i >= 0; i--) {
        const d = new Date(); d.setMonth(d.getMonth() - i);
        const ms = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        let total = 0;
        dateMap.forEach((sets, date) => { if (date.startsWith(ms)) total += sets; });
        data.push({ label: `${d.getMonth() + 1}月`, totalSets: total });
      }
    }

    const rankingMap = new Map<string, { id: string; name: string; totalSets: number }>();
    for (const action of actions) {
      const totalSets = allRecords
        .filter((r) => r.actionId === action.id)
        .reduce((s, r) => s + r.sets, 0);
      if (totalSets > 0) rankingMap.set(action.id, { id: action.id, name: action.name, totalSets });
    }
    const ranking = Array.from(rankingMap.values()).sort((a, b) => b.totalSets - a.totalSets);

    let streak = 0;
    const checkDate = new Date();
    while (true) {
      const ds = checkDate.toISOString().slice(0, 10);
      if ((dateMap.get(ds) ?? 0) > 0) { streak++; checkDate.setDate(checkDate.getDate() - 1); }
      else break;
    }

    const uniqueDays = dateMap.size || 1;
    const avgPerDay = Math.round((totalAllTimeSets / uniqueDays) * 10) / 10;

    return NextResponse.json({
      period, totalSets: totalAllTimeSets, todaySets, weekSets, monthSets,
      totalAllTimeSets, avgPerDay, streak, data, ranking,
    });
  } catch (error) {
    console.error("获取统计数据失败:", error);
    return NextResponse.json({ error: "获取统计数据失败" }, { status: 500 });
  }
}

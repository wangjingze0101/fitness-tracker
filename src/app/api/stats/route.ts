import { NextRequest, NextResponse } from "next/server";
import * as storage from "@/lib/storage";
import { getUserIdFromRequest } from "@/lib/auth";
import { todayStr, getWeekRange, getMonthRange } from "@/lib/date";

export async function GET(request: NextRequest) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "请先登录" }, { status: 401 });
  try {
    const period = new URL(request.url).searchParams.get("period") || "monthly";
    const today = todayStr();
    const { start: ws, end: we } = getWeekRange();
    const { start: ms, end: me } = getMonthRange();
    const allRecords = await storage.getAllRecords(userId);
    const actions = await storage.getActions(userId);

    const dateMap = new Map<string, number>();
    for (const r of allRecords) dateMap.set(r.date, (dateMap.get(r.date) ?? 0) + r.sets);

    const todaySets = dateMap.get(today) ?? 0;
    let weekSets = 0, monthSets = 0;
    dateMap.forEach((v, d) => { if (d >= ws && d <= we) weekSets += v; if (d >= ms && d <= me) monthSets += v; });
    const totalAll = allRecords.reduce((s, r) => s + r.sets, 0);

    let data: { label: string; totalSets: number }[] = [];
    if (period === "daily") {
      for (let i = 6; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        const dn = ["日","一","二","三","四","五","六"];
        data.push({ label: `周${dn[d.getDay()]}`, totalSets: dateMap.get(d.toISOString().slice(0,10)) ?? 0 });
      }
    } else if (period === "weekly") {
      for (let i = 3; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i * 7);
        const day = d.getDay(); const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        const mon = new Date(d.getFullYear(), d.getMonth(), diff);
        const sun = new Date(mon); sun.setDate(sun.getDate() + 6);
        let t = 0;
        dateMap.forEach((v, dd) => { if (dd >= mon.toISOString().slice(0,10) && dd <= sun.toISOString().slice(0,10)) t += v; });
        data.push({ label: `${mon.getMonth()+1}/${mon.getDate()}周`, totalSets: t });
      }
    } else {
      for (let i = 5; i >= 0; i--) {
        const d = new Date(); d.setMonth(d.getMonth() - i);
        const pref = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
        let t = 0; dateMap.forEach((v, dd) => { if (dd.startsWith(pref)) t += v; });
        data.push({ label: `${d.getMonth()+1}月`, totalSets: t });
      }
    }

    const ranking: { id: string; name: string; totalSets: number }[] = [];
    for (const a of actions) {
      const ts = allRecords.filter(r => r.actionId === a.id).reduce((s, r) => s + r.sets, 0);
      if (ts > 0) ranking.push({ id: a.id, name: a.name, totalSets: ts });
    }
    ranking.sort((a, b) => b.totalSets - a.totalSets);

    let streak = 0;
    const cd = new Date();
    while (true) { const ds = cd.toISOString().slice(0,10); if ((dateMap.get(ds)??0) > 0) { streak++; cd.setDate(cd.getDate()-1); } else break; }

    return NextResponse.json({ period, totalSets: totalAll, todaySets, weekSets, monthSets, totalAllTimeSets: totalAll, avgPerDay: Math.round((totalAll/(dateMap.size||1))*10)/10, streak, data, ranking });
  } catch (e) { console.error(e); return NextResponse.json({ error: "获取失败" }, { status: 500 }); }
}

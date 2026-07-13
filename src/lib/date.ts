import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  getISODay,
  getWeek,
  getMonth,
  eachDayOfInterval,
  subDays,
  addDays,
  isToday,
  parseISO,
  getYear,
} from "date-fns";
import { zhCN } from "date-fns/locale";

/** 获取今天的日期字符串 YYYY-MM-DD */
export function todayStr(): string {
  return format(new Date(), "yyyy-MM-dd");
}

/** 格式化日期为 YYYY-MM-DD */
export function toDateStr(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

/** 格式化日期为中文显示 */
export function formatDateCN(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return format(d, "M月d日", { locale: zhCN });
}

/** 格式化日期为带星期 */
export function formatDateFull(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return format(d, "yyyy年M月d日 EEEE", { locale: zhCN });
}

/** 获取本周开始和结束日期 */
export function getWeekRange() {
  const now = new Date();
  return {
    start: toDateStr(startOfWeek(now, { weekStartsOn: 1 })),
    end: toDateStr(endOfWeek(now, { weekStartsOn: 1 })),
  };
}

/** 获取本月开始和结束日期 */
export function getMonthRange() {
  const now = new Date();
  return {
    start: toDateStr(startOfMonth(now)),
    end: toDateStr(endOfMonth(now)),
  };
}

/** 获取一年中的每一天信息（用于热力图） */
export function getYearDays(year: number) {
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31);
  return eachDayOfInterval({ start, end }).map((d) => ({
    date: toDateStr(d),
    dayOfWeek: getISODay(d) % 7, // 0=Sun ... 6=Sat → 调整到周一为起始...
    weekIndex: getWeek(d, { weekStartsOn: 1, locale: zhCN }) - 1,
    month: getMonth(d),
    isToday: isToday(d),
  }));
}

/** 生成热力图单元格数据 */
export function generateHeatmapCells(
  year: number,
  dataMap: Map<string, number>
) {
  const yearDays = getYearDays(year);

  // 找到一个统一的 weekIndex 基准
  const days = yearDays.map((d) => {
    const totalSets = dataMap.get(d.date) ?? 0;
    return {
      date: d.date,
      dayOfWeek: d.dayOfWeek,
      month: d.month,
      isToday: d.isToday,
      totalSets,
      level: getHeatLevel(totalSets),
    };
  });

  return days;
}

/** 热力图颜色等级 */
function getHeatLevel(sets: number): 0 | 1 | 2 | 3 | 4 {
  if (sets === 0) return 0;
  if (sets <= 3) return 1;
  if (sets <= 7) return 2;
  if (sets <= 15) return 3;
  return 4;
}

/** 获取一天的开始和结束时间 */
export { getISODay, getWeek, getMonth, getYear, format };

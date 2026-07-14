// ========== 训练动作 ==========

export interface Action {
  id: string;
  name: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ActionWithToday extends Action {
  todaySets: number;
  todayReps: number;
  totalSets: number;
  totalReps: number;
  lastWorkoutDate: string | null;
  lastWorkoutSets: number | null;
  lastWorkoutReps: number;
  logId: string | null;
}

// ========== 训练记录 ==========

export interface WorkoutRecord {
  id: string;
  actionId: string;
  date: string; // "YYYY-MM-DD"
  sets: number;
  reps: number;
  createdAt: string;
  updatedAt: string;
}

export interface TodayResponse {
  date: string;
  actions: ActionWithToday[];
  totalSets: number;
}

// ========== 统计数据 ==========

export type StatsPeriod = "daily" | "weekly" | "monthly" | "lifetime";

export interface PeriodDataPoint {
  label: string;
  totalSets: number;
}

export interface ActionRank {
  id: string;
  name: string;
  totalSets: number;
}

export interface StatsResponse {
  period: StatsPeriod;
  totalSets: number;
  todaySets: number;
  weekSets: number;
  monthSets: number;
  totalAllTimeSets: number;
  avgPerDay: number;
  streak: number;
  data: PeriodDataPoint[];
  ranking: ActionRank[];
}

// ========== 日历数据 ==========

export interface CalendarDay {
  date: string;
  totalSets: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface CalendarResponse {
  year: number;
  days: CalendarDay[];
}

export interface DayDetail {
  date: string;
  records: {
    actionId: string;
    actionName: string;
    sets: number;
    reps: number;
  }[];
  totalSets: number;
}

// ========== 动作独立日历 ==========

export interface ActionCalendarDay {
  date: string;
  sets: number;
  reps: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface ActionCalendarResponse {
  actionId: string;
  actionName: string;
  year: number;
  days: ActionCalendarDay[];
}

// ========== 身体数据 ==========

export interface BodyMetric {
  id: string;
  date: string;
  weight: number | null;
  height: number | null;
  bmi: number | null;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

// ========== API 通用响应 ==========

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

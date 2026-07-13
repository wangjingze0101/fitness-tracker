/** 前端 API 调用封装 */

const BASE_URL = "/api";

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "请求失败" }));
    throw new Error(error.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// ========== 训练动作 API ==========

export async function fetchActions() {
  return request<{ actions: import("@/types").ActionWithToday[] }>(
    `/actions?date=${new Date().toISOString().slice(0, 10)}`
  );
}

export async function createAction(name: string) {
  return request<{ action: import("@/types").Action }>("/actions", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export async function updateAction(id: string, name: string) {
  return request<{ action: import("@/types").Action }>(`/actions/${id}`, {
    method: "PUT",
    body: JSON.stringify({ name }),
  });
}

export async function deleteAction(id: string) {
  return request<{ success: boolean }>(`/actions/${id}`, { method: "DELETE" });
}

export async function reorderActions(orderedIds: string[]) {
  return request<{ success: boolean }>("/actions/reorder", {
    method: "PUT",
    body: JSON.stringify({ orderedIds }),
  });
}

// ========== 训练记录 API ==========

export async function fetchRecords(actionId: string) {
  return request<{ records: import("@/types").WorkoutRecord[] }>(
    `/actions/${actionId}/records`
  );
}

export async function upsertTodayRecord(actionId: string, sets: number, reps: number) {
  const date = new Date().toISOString().slice(0, 10);
  return request<{ log: import("@/types").WorkoutRecord }>(
    `/actions/${actionId}/records`,
    {
      method: "PUT",
      body: JSON.stringify({ date, sets, reps }),
    }
  );
}

export async function updateRecord(
  actionId: string,
  date: string,
  sets: number,
  reps: number
) {
  return request<{ log: import("@/types").WorkoutRecord }>(
    `/actions/${actionId}/records/${date}`,
    {
      method: "PUT",
      body: JSON.stringify({ sets, reps }),
    }
  );
}

export async function deleteRecord(actionId: string, date: string) {
  return request<{ success: boolean }>(
    `/actions/${actionId}/records/${date}`,
    { method: "DELETE" }
  );
}

// ========== 统计 API ==========

export async function fetchStats(period: string = "monthly") {
  return request<import("@/types").StatsResponse>(`/stats?period=${period}`);
}

export async function fetchCalendar(year: number) {
  return request<import("@/types").CalendarResponse>(`/stats/calendar?year=${year}`);
}

export async function fetchDayDetail(date: string) {
  return request<import("@/types").DayDetail>(`/stats/${date}`);
}

// ========== 身体数据 API ==========

export async function fetchBodyMetrics() {
  return request<{ metrics: import("@/types").BodyMetric[] }>("/body");
}

export async function createBodyMetric(data: {
  date: string;
  weight?: number;
  height?: number;
  note?: string;
}) {
  return request<{ metric: import("@/types").BodyMetric }>("/body", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateBodyMetric(
  id: string,
  data: { weight?: number; height?: number; note?: string }
) {
  return request<{ metric: import("@/types").BodyMetric }>(`/body/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteBodyMetric(id: string) {
  return request<{ success: boolean }>(`/body/${id}`, { method: "DELETE" });
}

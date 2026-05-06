const API_BASE = "/api";

export type DailyCount = {
  date: string;
  entry_count: number;
};

export type ReflectionOut = {
  type: string;
  message: string;
  resource_slug?: string | null;
  severity: "info" | "note";
};

export type WeeklyReflection = {
  total_entries: number;
  active_days: number;
  empty_days: number;
  daily: DailyCount[];
  summary: string;
  prompts: string[];
  suggestions: ReflectionOut[];
};

export function authHeaders(): Record<string, string> {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function throwIfNotOk(res: Response, msg: string) {
  if (!res.ok) throw new Error(`${msg}: ${await res.text()}`);
}

export async function getWeeklyReflection(): Promise<WeeklyReflection> {
  const res = await fetch(`${API_BASE}/reflections/weekly`, {
    headers: authHeaders(),
  });
  await throwIfNotOk(res, "Failed to load weekly reflection");
  return res.json();
}
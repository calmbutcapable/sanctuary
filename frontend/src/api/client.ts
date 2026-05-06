import { authHeaders } from "./auth";

const API_BASE = "";

class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function throwIfNotOk(res: Response, context: string) {
  if (res.ok) return;

  let detail = "";
  try {
    const data = await res.json();
    detail = data?.detail ? `: ${String(data.detail)}` : "";
  } catch {
    // ignore
  }

  throw new ApiError(res.status, `${context}${detail}`);
}

export type Profile = {
  id: string;
  display_name: string;
};

export type Memory = {
  id: number;
  raw_text: string;
  entry_type: string;
  energy_level?: number | null;
  created_at: string;
};

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

export type DailyEnergy = {
  date: string;
  average_energy: number | null;
  sample_count: number;
};

export type WeeklyReflection = {
  total_entries: number;
  active_days: number;
  empty_days: number;

  daily: DailyCount[];
  daily_energy: DailyEnergy[];

  summary: string | null;
  prompts: string[];
  suggestions: ReflectionOut[];
  energy_reflections?: ReflectionOut[];

  average_energy?: number | null;
  low_energy_checkins?: number;
};

export type Plan = {
  id: number;
  thread_id: number;
  title: string;
  description?: string;
  is_archived: boolean;
  created_at: string;
};

export type Step = {
  id: number;
  plan_id: number;
  title: string;
  description?: string | null;
  position: number;
  is_completed: boolean;
  completed_at?: string | null;
  created_at: string;
  notes?: string;
  refined_output?: string;
};

export type Thread = {
  id: number;
  user_id: string;
  title: string;
  thread_type: string;
  description?: string | null;
  created_at: string;
};

export type ThreadCreate = {
  title: string;
  thread_type: string;
  description?: string;
};

export type AIPlanRequest = {
  goal: string;
  time_available: string;
  skill_level: string;
};

export type PlanStep = {
  title: string;
  description: string;
};

export type AIPlanResponse = {
  steps: PlanStep[];
};

export type ResumeResponse = {
  source: "handoff" | "meaningful_action" | "active_work" | "empty";
  last_completed_text?: string | null;
  suggested_next_options?: string[] | null;
  preferred_next_option?: string | null;
  action_type?: string | null;
  label?: string | null;
  thread_id?: number | null;
  thread_title?: string | null;
  plan_id?: number | null;
  next_open_step?: string | null;
};

export type AIChatRequest = {
  message: string;
};

export type AIChatResponse = {
  response: string;
};

export type ExportDocxRequest = {
  include_progress_summary?: boolean;
  include_completed_steps?: boolean;
  include_project_notes?: boolean;
  include_next_actions?: boolean;
  include_reflection_summary?: boolean;
  include_reflection_prompts?: boolean;
  include_ai_support_notice?: boolean;
  include_display_name?: boolean;
  include_export_date?: boolean;
};

export type JournalEntry = {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
};

export async function createAIChat(payload: AIChatRequest): Promise<AIChatResponse> {
  const token = localStorage.getItem("access_token");

  const res = await fetch("/api/ai/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to get AI response: ${res.status} ${text}`);
  }

  return res.json();
}

export async function getResume(): Promise<ResumeResponse> {
  const res = await fetch(`${API_BASE}/resume`, {
    headers: {
      ...authHeaders(),
    },
  });
  await throwIfNotOk(res, "Failed to fetch resume");
  return res.json();
}

export async function createAIPlan(payload: AIPlanRequest): Promise<AIPlanResponse> {
  const token = localStorage.getItem("access_token");

  const res = await fetch("/ai/plan", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to create plan: ${res.status} ${text}`);
  }

  return res.json();
}

export async function getProfile(): Promise<Profile> {
  const res = await fetch(`${API_BASE}/profile/`, {
    headers: {
      ...authHeaders(),
    },
  });
  await throwIfNotOk(res, "Failed to load profile");
  return res.json();
}

export async function getRecentMemories(limit = 10): Promise<Memory[]> {
  const res = await fetch(`${API_BASE}/memory/recent?limit=${limit}`, {
    headers: {
      ...authHeaders(),
    },
  });
  await throwIfNotOk(res, "Failed to load memories");
  return res.json();
}

export async function getHomeSummary() {
  const res = await fetch(`${API_BASE}/home/summary`, {
    headers: {
      ...authHeaders(),
    },
  });

  await throwIfNotOk(res, "Failed to load home summary");
  return res.json();
}

export async function createMemory(
  raw_text: string,
  entry_type: string = "checkin",
  energy_level: number | null = null
): Promise<Memory> {
  const res = await fetch(`${API_BASE}/memory`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify({ raw_text, entry_type, energy_level }),
  });

  await throwIfNotOk(res, "Failed to create memory");
  return res.json();
}

export async function deleteMemory(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/memory/${id}`, {
    method: "DELETE",
    headers: {
      ...authHeaders(),
    },
  });
  await throwIfNotOk(res, "Failed to delete memory");
}

export async function getWeeklyReflection(): Promise<WeeklyReflection> {
  const res = await fetch(`${API_BASE}/reflections/weekly`, {
    headers: {
      ...authHeaders(),
    },
  });
  await throwIfNotOk(res, "Failed to load weekly reflection");
  return res.json();
}

export async function getThreads(): Promise<Thread[]> {
  const res = await fetch(`${API_BASE}/threads/`, {
    headers: {
      ...authHeaders(),
    },
  });
  await throwIfNotOk(res, "Failed to load threads");
  return res.json();
}

export async function generateAIReflection() {
  const res = await fetch(`${API_BASE}/reflections/ai`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    credentials: "include",
    body: JSON.stringify({}),
  });

  await throwIfNotOk(res, "Failed to generate AI reflection");
  return res.json();
}

export async function createThread(payload: ThreadCreate): Promise<Thread> {
  const res = await fetch(`${API_BASE}/threads/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(payload),
  });
  await throwIfNotOk(res, "Failed to create thread");
  return res.json();
}

export async function getThread(threadId: number): Promise<Thread> {
  const res = await fetch(`${API_BASE}/threads/${threadId}`, {
    headers: {
      ...authHeaders(),
    },
  });
  await throwIfNotOk(res, "Failed to load thread");
  return res.json();
}

export async function createPlan(payload: {
  thread_id: number;
  title: string;
  description?: string;
}): Promise<Plan> {
  const res = await fetch(`${API_BASE}/plans/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(payload),
  });
  await throwIfNotOk(res, "Failed to create plan");
  return res.json();
}

export async function getThreadPlans(threadId: number): Promise<Plan[]> {
  const res = await fetch(`${API_BASE}/plans/thread/${threadId}`, {
    headers: {
      ...authHeaders(),
    },
  });
  await throwIfNotOk(res, "Failed to load plans");
  return res.json();
}

export async function createStep(
  planId: number,
  payload: {
    title: string;
    description?: string;
    position?: number;
  }
): Promise<Step> {
  const res = await fetch(`${API_BASE}/steps/plan/${planId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(payload),
  });
  await throwIfNotOk(res, "Failed to create step");
  return res.json();
}

export async function getPlanSteps(planId: number): Promise<Step[]> {
  const res = await fetch(`${API_BASE}/steps/plan/${planId}`, {
    headers: {
      ...authHeaders(),
    },
  });
  await throwIfNotOk(res, "Failed to load steps");
  return res.json();
}

export async function updateStep(
  stepId: number,
  payload: {
    is_completed?: boolean;
    notes?: string;
    refined_output?: string;
  }
) {

  const res = await fetch(`${API_BASE}/steps/${stepId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(payload),
  });
  await throwIfNotOk(res, "Failed to update step");
  return res.json();
}

export async function exportPlanDocx(
  planId: number,
  payload: ExportDocxRequest = {}
): Promise<void> {
  const res = await fetch(`${API_BASE}/threads/plans/${planId}/export/docx`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(payload),
  });

  await throwIfNotOk(res, "Failed to export DOCX");

  const blob = await res.blob();

  const contentDisposition = res.headers.get("Content-Disposition");
  let filename = `plan-${planId}.docx`;

  if (contentDisposition) {
    const match = contentDisposition.match(/filename="?([^"]+)"?/i);
    if (match?.[1]) {
      filename = match[1];
    }
  }

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export async function getJournalEntries(): Promise<JournalEntry[]> {
  const res = await fetch(`${API_BASE}/journal-entries/`, {
    headers: {
      ...authHeaders(),
    },
  });
  await throwIfNotOk(res, "Failed to load journal entries");
  return res.json();
}

export async function createJournalEntry(content: string): Promise<JournalEntry> {
  const res = await fetch(`${API_BASE}/journal-entries/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify({ content }),
  });
  await throwIfNotOk(res, "Failed to create journal entry");
  return res.json();
}

export async function updateJournalEntry(
  id: string,
  content: string
): Promise<JournalEntry> {
  const res = await fetch(`${API_BASE}/journal-entries/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify({ content }),
  });
  await throwIfNotOk(res, "Failed to update journal entry");
  return res.json();
}

export async function deleteJournalEntry(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/journal-entries/${id}`, {
    method: "DELETE",
    headers: {
      ...authHeaders(),
    },
  });
  await throwIfNotOk(res, "Failed to delete journal entry");
}

export async function updatePlan(
  planId: number,
  data: { title?: string; description?: string; is_archived?: boolean }
): Promise<Plan> {
  const res = await fetch(`${API_BASE}/plans/${planId}`, {
    method: "PATCH",
    headers: {
      ...authHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  await throwIfNotOk(res, "Failed to update plan");
  return res.json();
}
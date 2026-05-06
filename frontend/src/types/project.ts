export type StepStatus = "not_started" | "active" | "supporting" | "completed" | "skipped";

export type SupportMode =
  | "idle"
  | "clarify"
  | "options"
  | "guide"
  | "escalate"
  | "learning";

export type SupportMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
};

export type StepMethodOption = {
  id: string;
  label: string; // "Quick and simple"
  description: string;
};

export type StepLearning = {
  summary: string;
  isSpecific: boolean;
  nextTime?: string;
};

export type ProjectStep = {
  id: string;
  title: string;
  description: string;
  status: StepStatus;
  supportMode: SupportMode;
  supportMessages: SupportMessage[];
  availableMethods?: StepMethodOption[];
  selectedMethodId?: string;
  learning?: StepLearning;
  notes?: string;
  refinedOutput?: string;
};

export type Project = {
  id: string;
  title: string;
  goal: string;
  currentStepId?: string;
  steps: ProjectStep[];
};
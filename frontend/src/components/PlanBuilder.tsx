import React from "react";
import { createAIPlan, createAIChat, PlanStep } from "../api/client";
import type { Project } from "../types/project";

type PlanBuilderProps = {
  onPlanCreated: (steps: PlanStep[], goal: string) => void;
};

export default function PlanBuilder({ onPlanCreated }: PlanBuilderProps) {
  const [goal, setGoal] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  
  async function handleCreatePlan() {
    setError(null);

    if (!goal.trim()) {
      setError("Please enter a goal.");
      return;
    }

      setLoading(true);

    try {
  const result = await createAIPlan({
  goal: goal.trim(),
  time_available: "Not specified",
  skill_level: "beginner",
});

  onPlanCreated(result.steps || [], goal.trim());
} catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong creating the plan.");
    } finally {
      setLoading(false);
    }
  }
  const [project, setProject] = React.useState<Project>({
    id: "1",
    title: "My First Project",
    goal: "Test Sanctuary system",
    currentStepId: "step-1",
    steps: [
      {
        id: "step-1",
        title: "Define the problem",
        description: "Work out what this project is solving",
        status: "not_started",
        supportMode: "idle",
        supportMessages: [],
      },
    ],
  });

  const currentStep = project.steps.find(
    (s) => s.id === project.currentStepId
  );

  const [input, setInput] = React.useState("");

    async function handleSendMessage() {
  if (!input.trim() || !currentStep) return;

  const userText = input.trim();

  const userMessage = {
    id: crypto.randomUUID(),
    role: "user" as const,
    content: userText,
    timestamp: new Date().toISOString(),
  };

  setProject((prev) => ({
    ...prev,
    steps: prev.steps.map((step) =>
      step.id === prev.currentStepId
        ? {
            ...step,
            supportMessages: [...step.supportMessages, userMessage],
          }
        : step
    ),
  }));

  setInput("");

  try {
    const result = await createAIChat({ message: userText });

    const aiMessage = {
      id: crypto.randomUUID(),
      role: "assistant" as const,
      content: result.response,
      timestamp: new Date().toISOString(),
    };

    setProject((prev) => ({
      ...prev,
      steps: prev.steps.map((step) =>
        step.id === prev.currentStepId
          ? {
              ...step,
              supportMessages: [...step.supportMessages, aiMessage],
            }
          : step
      ),
    }));
  } catch (err) {
    const aiMessage = {
      id: crypto.randomUUID(),
      role: "assistant" as const,
      content:
        err instanceof Error
          ? err.message
          : "Something went wrong getting support.",
      timestamp: new Date().toISOString(),
    };

    setProject((prev) => ({
      ...prev,
      steps: prev.steps.map((step) =>
        step.id === prev.currentStepId
          ? {
              ...step,
              supportMessages: [...step.supportMessages, aiMessage],
            }
          : step
      ),
    }));
  }
}
  return (
  <section style={{ maxWidth: 820, margin: "0 auto" }}>
    <h2 style={{ marginTop: 0 }}>Project Guide</h2>
    <p style={{ opacity: 0.8, fontSize: "1rem" }}>
      Describe what you want to achieve and Sanctuary will help you break it into manageable steps.
    </p>

    <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
      <div>
        <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
          What do you want to achieve?
        </label>
        <textarea
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          rows={4}
          placeholder="For example: Create a short presentation about online safety for college students"
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 8,
            border: "1px solid #ccc",
            fontSize: "1rem",
            resize: "vertical",
            boxSizing: "border-box",
          }}
        />
      </div>

      <div style={{ marginTop: 4 }}>
        <button
          type="button"
          onClick={handleCreatePlan}
          disabled={loading}
          style={{
            padding: "12px 18px",
            borderRadius: 8,
            border: "1px solid #ccc",
            cursor: loading ? "default" : "pointer",
            fontSize: "1rem",
          }}
        >
         {loading ? "Creating project..." : "Create Project"}
        </button>
      </div>
    </div>

    {error && (
      <p style={{ marginTop: 16, color: "#b00020" }}>
        {error}
      </p>
    )}
  </section>
);
}
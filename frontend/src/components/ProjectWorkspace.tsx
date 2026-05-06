import React, { useEffect, useState } from "react";
import { getPlanSteps, updateStep, exportPlanDocx, Step } from "../api/client";

type Props = {
  planId: number;
  planTitle: string;
  planDescription?: string;
  onBack: () => void;
  onCaptureSessionNote: (note: string) => Promise<void>;
};

export default function ProjectWorkspace({
  planId,
  planTitle,
  planDescription,
  onBack,
  onCaptureSessionNote,
}: Props) {
  const [steps, setSteps] = useState<Step[]>([]);
  const [loading, setLoading] = useState(true);
  const [showExitCheck, setShowExitCheck] = useState(false);
  const [sessionNote, setSessionNote] = useState("");

  const [showThinkWithMe, setShowThinkWithMe] = useState(false);
  const [thinkingText, setThinkingText] = useState("");
  const [aiSupport, setAiSupport] = useState("");
  const [loadingSupport, setLoadingSupport] = useState(false);
  const [exportingDocx, setExportingDocx] = useState(false);
  const [exportMessage, setExportMessage] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [currentStep, setCurrentStep] = useState<Step | null>(null);
  useEffect(() => {
  if (currentStep) {
    setSessionNote(currentStep.notes ?? "");
  }
}, [currentStep]);
  const [showExportOptions, setShowExportOptions] = useState(false);

  const [exportOptions, setExportOptions] = useState({
    include_progress_summary: true,
    include_completed_steps: true,
    include_project_notes: true,
    include_next_actions: true,
    include_reflection_summary: false,
    include_reflection_prompts: false,
    include_display_name: false,
    include_export_date: true,
  });

  useEffect(() => {
    async function load() {
      try {
        const data = await getPlanSteps(planId);
        setSteps(data);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [planId]);

  const nextStep = steps.find((step) => !step.is_completed) ?? null;
  const completedCount = steps.filter((step) => step.is_completed).length;
  const totalCount = steps.length;
  const allComplete = steps.length > 0 && steps.every((s) => s.is_completed);

  async function handleToggle(step: Step) {
    const updated = await updateStep(step.id, {
      is_completed: !step.is_completed,
    });

    setSteps((prev) =>
      prev.map((s) => (s.id === updated.id ? updated : s))
    );
  }

  async function handleUpdateStepNotes(
  step: Step,
  notes: string,
  refined_output?: string
) {
  setSaveStatus("saving");

  try {
    const updated = await updateStep(step.id, {
      notes,
      refined_output,
    });

    setSteps((prev) =>
      prev.map((s) => (s.id === updated.id ? updated : s))
    );

    setSaveStatus("saved");

    setTimeout(() => {
      setSaveStatus("idle");
    }, 2000);

  } catch (err) {
    setSaveStatus("idle");
  }
}

  async function handleSupportRequest(
    mode: "clarify" | "options" | "guide"
  ) {
    if (!currentStep) return;

    setLoadingSupport(true);
    setAiSupport("");

    try {
      const response = await fetch("/ai/project-support", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          plan_id: planId,
          step_id: currentStep.id,
          step_title: currentStep.title,
          step_description: currentStep.description,
          mode,
          user_thoughts: thinkingText,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get support");
      }

      const data = await response.json();
      setAiSupport(data.message);
    } catch {
      setAiSupport(
        "I couldn’t generate support just now. Try writing what feels unclear, then try again."
      );
    } finally {
      setLoadingSupport(false);
    }
  }

async function handleExportDocx() {
    try {
      setExportingDocx(true);
      setExportMessage(null);
      setExportError(null);

      await exportPlanDocx(planId, {
        ...exportOptions,
        include_ai_support_notice: true,
      });

      setExportMessage("DOCX downloaded successfully");
    } catch (err) {
      setExportError(
        err instanceof Error ? err.message : "Failed to export DOCX"
      );
    } finally {
      setExportingDocx(false);
    }
  }

  return (
    <section style={{ maxWidth: 900, margin: "0 auto", paddingTop: "1rem" }}>
      <button onClick={() => setShowExitCheck(true)}>← Back</button>

      <button
        type="button"
        onClick={handleExportDocx}
        disabled={exportingDocx}
        style={{ marginLeft: "0.5rem" }}
      >
        {exportingDocx ? "Exporting..." : "Export DOCX"}
      </button>

      <button
        type="button"
        onClick={() => setShowExportOptions((prev) => !prev)}
        disabled={exportingDocx}
        style={{ marginLeft: "0.5rem" }}
      >
        {showExportOptions ? "Hide options" : "Export options"}
      </button>

{showExportOptions ? (
  <div
    style={{
      marginTop: "0.75rem",
      marginBottom: "1rem",
      padding: "0.75rem",
      border: "1px solid #333",
      borderRadius: 12,
      display: "grid",
      gap: "0.5rem",
      background: "rgba(255,255,255,0.03)",
    }}
  >
    <label>
      <input
        type="checkbox"
        checked={exportOptions.include_progress_summary}
        onChange={(e) =>
          setExportOptions((prev) => ({
            ...prev,
            include_progress_summary: e.target.checked,
          }))
        }
      />{" "}
      Add progress summary
    </label>

    <label>
      <input
        type="checkbox"
        checked={exportOptions.include_completed_steps}
        onChange={(e) =>
          setExportOptions((prev) => ({
            ...prev,
            include_completed_steps: e.target.checked,
          }))
        }
      />{" "}
      Add completed steps
    </label>

    <label>
      <input
        type="checkbox"
        checked={exportOptions.include_project_notes}
        onChange={(e) =>
          setExportOptions((prev) => ({
            ...prev,
            include_project_notes: e.target.checked,
          }))
        }
      />{" "}
      Add project notes
    </label>

    <label>
      <input
        type="checkbox"
        checked={exportOptions.include_next_actions}
        onChange={(e) =>
          setExportOptions((prev) => ({
            ...prev,
            include_next_actions: e.target.checked,
          }))
        }
      />{" "}
      Add next actions
    </label>

    <label>
      <input
        type="checkbox"
        checked={exportOptions.include_reflection_summary}
        onChange={(e) =>
          setExportOptions((prev) => ({
            ...prev,
            include_reflection_summary: e.target.checked,
          }))
        }
      />{" "}
      Add reflection summary
    </label>

    <label>
      <input
        type="checkbox"
        checked={exportOptions.include_reflection_prompts}
        onChange={(e) =>
          setExportOptions((prev) => ({
            ...prev,
            include_reflection_prompts: e.target.checked,
          }))
        }
      />{" "}
      Add reflection prompts
    </label>

    <label>
      <input
        type="checkbox"
        checked={exportOptions.include_display_name}
        onChange={(e) =>
          setExportOptions((prev) => ({
            ...prev,
            include_display_name: e.target.checked,
          }))
        }
      />{" "}
      Add display name
    </label>

    <label>
      <input
        type="checkbox"
        checked={exportOptions.include_export_date}
        onChange={(e) =>
          setExportOptions((prev) => ({
            ...prev,
            include_export_date: e.target.checked,
          }))
        }
      />{" "}
      Add export date
    </label>
  </div>
) : null}

      {exportMessage ? (
        <p style={{ color: "#86efac" }}>{exportMessage}</p>
      ) : null}

      {exportError ? (
        <p style={{ color: "#fca5a5" }}>{exportError}</p>
      ) : null}

      {showExitCheck ? (
        <div
          style={{
            marginTop: "1.25rem",
            padding: "1rem",
            border: "1px solid #333",
            borderRadius: 12,
            background: "#111",
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: "0.5rem" }}>
            Before you leave
          </div>

          <p style={{ opacity: 0.8, marginTop: 0, marginBottom: "0.75rem" }}>
            Anything worth noting about how that went?
          </p>

          <textarea
            value={sessionNote}
            onChange={(e) => setSessionNote(e.target.value)}
            placeholder="Write a quick note if you want to..."
            rows={4}
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 8,
              border: "1px solid #444",
              background: "rgba(0,0,0,0.2)",
              color: "inherit",
              fontSize: "1rem",
              lineHeight: 1.5,
              resize: "vertical",
              marginBottom: "0.75rem",
            }}
          />

          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              onClick={async () => {
                if (sessionNote.trim()) {
                  await onCaptureSessionNote(sessionNote);
                }
                setSessionNote("");
                setShowExitCheck(false);
                onBack();
              }}
            >
              Save and leave
            </button>

            <button
              onClick={() => {
                setSessionNote("");
                setShowExitCheck(false);
                onBack();
              }}
            >
              Skip
            </button>
          </div>
        </div>
      ) : null}

      <h1 style={{ marginTop: "1rem" }}>{planTitle}</h1>

      {planDescription ? (
        <p
          style={{
            opacity: 0.75,
            marginTop: "-0.5rem",
            marginBottom: "0.75rem",
          }}
        >
          {planDescription}
        </p>
      ) : null}

      <p style={{ opacity: 0.7, marginTop: "-0.25rem", marginBottom: "1rem" }}>
        {completedCount} of {totalCount} steps complete
      </p>

      {loading ? <p>Loading...</p> : null}

   <div style={{ marginTop: "1rem" }}>
  {currentStep && (
    <div
      style={{
        marginTop: "1.5rem",
        padding: "1rem",
        border: "1px solid #333",
        borderRadius: 12,
        background: "rgba(255,255,255,0.03)",
        marginBottom: "1rem",
      }}
    >
      <h3>{currentStep.title}</h3>

      {currentStep.description ? <p>{currentStep.description}</p> : null}

      <p style={{ fontSize: "0.9rem", opacity: 0.75 }}>
        Use Rook to talk this step through, then capture anything useful in your notes to help build your final project.
      </p>

      <button
        type="button"
        onClick={() => setShowThinkWithMe((prev) => !prev)}
      >
        {showThinkWithMe ? "Hide support" : "Discuss this step with Rook"}
      </button>

      {showThinkWithMe ? (
        <div style={{ marginTop: "1rem" }}>
          <h4>Discuss this step with Rook</h4>

          <textarea
            value={thinkingText}
            onChange={(e) => setThinkingText(e.target.value)}
            placeholder="What are you thinking about this step?"
            rows={4}
            style={{ width: "100%", padding: 12 }}
          />

          <div style={{ marginTop: "0.75rem", display: "flex", gap: "0.5rem" }}>
            <button type="button" onClick={() => handleSupportRequest("clarify")}>
              Help me understand
            </button>

            <button type="button" onClick={() => handleSupportRequest("options")}>
              Give me options
            </button>

            <button type="button" onClick={() => handleSupportRequest("guide")}>
              Guide me
            </button>
          </div>

          {loadingSupport ? <p>Thinking this through...</p> : null}

          {aiSupport ? (
            <div style={{ marginTop: "0.75rem", whiteSpace: "pre-wrap" }}>
              {aiSupport}
            </div>
          ) : null}
        </div>
      ) : null}

      <textarea
        value={sessionNote}
        onChange={(e) => setSessionNote(e.target.value)}
        placeholder="Add your notes here… anything useful from your discussion with Rook"
        rows={5}
        style={{
          width: "100%",
          marginTop: "1rem",
          padding: 12,
          borderRadius: 8,
          border: "1px solid #555",
          background: "rgba(255,255,255,0.03)",
          color: "inherit",
          fontSize: "0.95rem",
        }}
      />

      <button
        type="button"
        onClick={() => handleUpdateStepNotes(currentStep, sessionNote)}
        style={{
          marginTop: "0.5rem",
          padding: "0.45rem 0.75rem",
          borderRadius: 8,
        }}
      >
        Save notes
      </button>

      {saveStatus === "saving" && (
        <div style={{ fontSize: "0.85rem", opacity: 0.7 }}>Saving...</div>
      )}

      {saveStatus === "saved" && (
        <div style={{ fontSize: "0.85rem", color: "#22c55e" }}>✔ Saved</div>
      )}

      {!allComplete ? (
  <button
    type="button"
    onClick={async () => {
      if (!currentStep) return;

      const updated = await updateStep(currentStep.id, {
        is_completed: true,
      });

      const updatedSteps = steps.map((s) =>
        s.id === updated.id ? updated : s
      );

      setSteps(updatedSteps);

      const next = updatedSteps.find((s) => !s.is_completed);

      if (next) {
        setCurrentStep(next);
      }
    }}
  >
    Next Step →
  </button>
) : (
  <div style={{ marginTop: "1rem" }}>
    <p><strong>All steps are complete.</strong></p>
    <p>You can revisit any step or export your work.</p>

    <button onClick={handleExportDocx}>
      Export DOCX
    </button>
  </div>
)}
    </div>
  )}

  {steps.map((step) => (
    <button
      key={step.id}
      type="button"
      onClick={() => setCurrentStep(step)}
      style={{
        display: "block",
        width: "100%",
        textAlign: "left",
        padding: "0.75rem",
        border:
          currentStep?.id === step.id
            ? "2px solid #0991ED"
            : "1px solid #222",
        borderRadius: 10,
        marginBottom: "0.75rem",
        background: "rgba(255,255,255,0.03)",
        color: "inherit",
        cursor: "pointer",
      }}
    >
      <strong>{step.title}</strong>
      {step.is_completed && (
        <span style={{ marginLeft: "0.5rem", opacity: 0.75 }}>
          ✓ Complete
        </span>
      )}
    </button>
  ))}
</div>
    </section>
  );
}
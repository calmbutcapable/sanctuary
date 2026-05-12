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

  useEffect(() => {
    if (!currentStep) return;

    const existingNotes = currentStep.notes ?? "";

    if (sessionNote === existingNotes) return;

    const timer = window.setTimeout(() => {
      handleUpdateStepNotes(currentStep, sessionNote);
    }, 1200);

    return () => window.clearTimeout(timer);
  }, [sessionNote, currentStep]);

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

const firstIncomplete =
  data.find((step) => !step.is_completed) ?? data[data.length - 1];

if (firstIncomplete) {
  setCurrentStep(firstIncomplete);
}
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

      {allComplete ? (
        <>
          <button
            type="button"
            onClick={() => setShowExportOptions((prev) => !prev)}
            disabled={exportingDocx}
            style={{ marginLeft: "0.5rem" }}
          >
            {showExportOptions ? "Hide options" : "Export options"}
          </button>
        </>
      ) : null}

{allComplete && showExportOptions ? (
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

      <div
        style={{
          marginTop: "1rem",
          display: "grid",
          gridTemplateColumns: "minmax(220px, 0.8fr) minmax(0, 1.6fr) minmax(260px, 0.9fr)",
          gap: "1rem",
          alignItems: "start",
        }}
      >
        <aside
          style={{
            padding: "1rem",
            border: "1px solid #333",
            borderRadius: 12,
            background: "rgba(255,255,255,0.03)",
          }}
        >
          <h3 style={{ marginTop: 0 }}>Project steps</h3>

          <p style={{ fontSize: "0.9rem", opacity: 0.75 }}>
            Work through each step in order. You can return to earlier steps whenever you need to.
          </p>

          {steps.map((step, index) => {
            const firstIncompleteIndex = steps.findIndex((s) => !s.is_completed);
            const activeIndex =
              firstIncompleteIndex === -1 ? steps.length - 1 : firstIncompleteIndex;
            const isUnlocked = index <= activeIndex || step.is_completed;
            const isActive = currentStep?.id === step.id;

            return (
              <button
                key={step.id}
                type="button"
                disabled={!isUnlocked}
                onClick={() => {
                  if (!isUnlocked) return;
                  setCurrentStep(step);
                  setShowThinkWithMe(false);
                  setAiSupport("");
                  setThinkingText("");
                }}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  padding: "0.75rem",
                  border: isActive ? "2px solid #0991ED" : "1px solid #222",
                  borderRadius: 10,
                  marginBottom: "0.75rem",
                  background: isUnlocked
                    ? "rgba(255,255,255,0.03)"
                    : "rgba(255,255,255,0.015)",
                  color: "inherit",
                  cursor: isUnlocked ? "pointer" : "not-allowed",
                  opacity: isUnlocked ? 1 : 0.45,
                }}
              >
                <strong>
                  {index + 1}. {step.title}
                </strong>

                {step.is_completed ? (
                  <span style={{ display: "block", marginTop: "0.25rem", opacity: 0.75 }}>
                    ✓ Complete
                  </span>
                ) : !isUnlocked ? (
                  <span style={{ display: "block", marginTop: "0.25rem", opacity: 0.75 }}>
                    Unlocks later
                  </span>
                ) : (
                  <span style={{ display: "block", marginTop: "0.25rem", opacity: 0.75 }}>
                    Current step
                  </span>
                )}
              </button>
            );
          })}
        </aside>

        <main
          style={{
            padding: "1rem",
            border: "1px solid #333",
            borderRadius: 12,
            background: "rgba(255,255,255,0.03)",
            minHeight: 360,
          }}
        >
          {currentStep ? (
            <>
              <h2 style={{ marginTop: 0 }}>{currentStep.title}</h2>

              {currentStep.description ? <p>{currentStep.description}</p> : null}

              <p style={{ fontSize: "0.95rem", opacity: 0.78 }}>
                Use this step to build your understanding. Save useful ideas, research,
                conclusions, or draft wording in your notes so they can become part of
                your final project document.
              </p>

              <textarea
                value={sessionNote}
                onChange={(e) => setSessionNote(e.target.value)}
                placeholder="Add useful notes, research, ideas, or conclusions for this step..."
                rows={10}
                style={{
                  width: "100%",
                  marginTop: "1rem",
                  padding: 12,
                  borderRadius: 8,
                  border: "1px solid #555",
                  background: "rgba(255,255,255,0.03)",
                  color: "inherit",
                  fontSize: "0.95rem",
                  lineHeight: 1.5,
                }}
              />

              <div
                style={{
                  marginTop: "0.75rem",
                  display: "flex",
                  gap: "0.5rem",
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                {!allComplete ? (
                  <button
                    type="button"
                    onClick={async () => {
                      if (!currentStep) return;

                      await handleUpdateStepNotes(currentStep, sessionNote);

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
                    style={{
                      padding: "0.45rem 0.75rem",
                      borderRadius: 8,
                    }}
                  >
                    Move to next step →
                  </button>
                ) : null}
              </div>

              {saveStatus === "saving" && (
                <div style={{ fontSize: "0.85rem", opacity: 0.7, marginTop: "0.5rem" }}>
                  Saving...
                </div>
              )}

              {saveStatus === "saved" && (
                <div style={{ fontSize: "0.85rem", color: "#22c55e", marginTop: "0.5rem" }}>
                  ✔ Saved
                </div>
              )}

              {allComplete ? (
                <div
                  style={{
                    marginTop: "1rem",
                    padding: "1rem",
                    border: "1px solid #333",
                    borderRadius: 12,
                    background: "rgba(255,255,255,0.03)",
                  }}
                >
                  <h3 style={{ marginTop: 0 }}>Project complete</h3>
                  <p>
                    You have completed all the steps. Would you like to revisit
                    anything or export your document?
                  </p>

                  <button
                    type="button"
                    onClick={handleExportDocx}
                    disabled={exportingDocx}
                    style={{
                      padding: "0.45rem 0.75rem",
                      borderRadius: 8,
                    }}
                  >
                    {exportingDocx ? "Exporting..." : "Export DOCX"}
                  </button>
                </div>
              ) : null}
            </>
          ) : (
            <p>Select the first step to begin.</p>
          )}
        </main>

        <aside
          style={{
            padding: "1rem",
            border: "1px solid #333",
            borderRadius: 12,
            background: "rgba(255,255,255,0.03)",
            position: "sticky",
            top: "1rem",
          }}
        >
          <h3 style={{ marginTop: 0 }}>Rook</h3>

          <p style={{ fontSize: "0.9rem", opacity: 0.75 }}>
            Ask Rook questions about the current step. Keep anything useful by adding it to your notes.
          </p>

          <textarea
            value={thinkingText}
            onChange={(e) => setThinkingText(e.target.value)}
            placeholder="Ask about this step, request ideas, or explain what feels unclear..."
            rows={5}
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 8,
              border: "1px solid #555",
              background: "rgba(255,255,255,0.03)",
              color: "inherit",
              fontSize: "0.95rem",
              lineHeight: 1.5,
            }}
          />

          <div style={{ marginTop: "0.75rem", display: "grid", gap: "0.5rem" }}>
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
            <div
              style={{
                marginTop: "0.75rem",
                padding: "0.75rem",
                border: "1px solid #333",
                borderRadius: 10,
                background: "rgba(0,0,0,0.18)",
                whiteSpace: "pre-wrap",
                fontSize: "0.95rem",
                lineHeight: 1.5,
              }}
            >
              {aiSupport}
            </div>
          ) : null}
        </aside>
      </div>
    </section>
  );
}
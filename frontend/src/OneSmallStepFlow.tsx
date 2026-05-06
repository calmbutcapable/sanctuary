/**
 * OneSmallStepFlow
 *
 * Purpose:
 * A calm, non-directive flow that helps users name one small step
 * without pressure, optimisation, or judgement.
 *
 * Design principles:
 * - Progress by consent, not force
 * - Reflection before action
 * - Closure is a valid outcome
 * - Abstract steps are allowed (regulation counts)
 *
 * This is not task management.
 * This is supported orientation.
 */

import React, { useEffect, useMemo, useState } from "react";

type Screen = "ORIENTATION" | "CAPTURE" | "ACK" | "PICK_PROJECT" | "CLOSE" | "TRANSITION";

type GoToProjectPayload = { stepText: string; projectId: string };

type OneSmallStepFlowProps = {
  onGoToProject?: (payload: GoToProjectPayload) => void;
  onExit?: () => void;
  storageKey?: string;
};

type SaveStatus = "idle" | "saving" | "saved" | "unavailable";

const SCREENS: Record<Screen, Screen> = {
  ORIENTATION: "ORIENTATION",
  CAPTURE: "CAPTURE",
  ACK: "ACK",
  PICK_PROJECT: "PICK_PROJECT",
  CLOSE: "CLOSE",
  TRANSITION: "TRANSITION",
};

const PROJECTS = [
  { id: "sanctuary_build", name: "Build The Sanctuary" },
  { id: "daily_clarity", name: "Daily Clarity" },
  { id: "life_admin", name: "Life Admin" },
] as const;

function safeTrim(value: unknown): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function isValidScreen(value: unknown): value is Screen {
  return Object.values(SCREENS).includes(value as Screen);
}

function isValidProjectId(value: unknown): value is string {
  return typeof value === "string" && PROJECTS.some((p) => p.id === value);
}

export default function OneSmallStepFlow({
  onGoToProject,
  onExit,
  storageKey = "sanctuary_one_small_step_v1",
}: OneSmallStepFlowProps) {
  const [screen, setScreen] = useState<Screen>(SCREENS.ORIENTATION);
  const [stepText, setStepText] = useState<string>("");
  const [projectId, setProjectId] = useState<string>(PROJECTS[0].id);

  const [hydrated, setHydrated] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");

  // Load previously saved draft (optional)
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) return;

      const parsed = JSON.parse(raw);

      if (typeof parsed?.stepText === "string") setStepText(parsed.stepText);
      if (isValidScreen(parsed?.screen)) setScreen(parsed.screen);
      if (isValidProjectId(parsed?.projectId)) setProjectId(parsed.projectId);
    } catch {
      // ignore corrupted storage
    } finally {
      setHydrated(true);
    }
  }, [storageKey]);

  // Persist draft — debounced + status indicator
  useEffect(() => {
    if (!hydrated) return;

    let timer: number | undefined;

    try {
      setSaveStatus("saving");

      timer = window.setTimeout(() => {
        try {
          window.localStorage.setItem(
            storageKey,
            JSON.stringify({ screen, stepText, projectId })
          );
          setSaveStatus("saved");
          window.setTimeout(() => setSaveStatus("idle"), 1200);
        } catch {
          setSaveStatus("unavailable");
        }
      }, 450);
    } catch {
      setSaveStatus("unavailable");
    }

    return () => {
      if (timer) window.clearTimeout(timer);
    };
  }, [hydrated, screen, stepText, projectId, storageKey]);

  const normalizedStep = useMemo(() => safeTrim(stepText), [stepText]);

  function doneForNow() {
    setScreen(SCREENS.CLOSE);
  }

  function resetFlow() {
    setStepText("");
    setScreen(SCREENS.ORIENTATION);
    setProjectId(PROJECTS[0].id);
    try {
      window.localStorage.removeItem(storageKey);
    } catch {
      // ignore
    }
  }

  const Card: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div
      style={{
        maxWidth: 640,
        margin: "24px auto",
        padding: 20,
        border: "1px solid #e5e5e5",
        borderRadius: 12,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "baseline" }}>
          <h2 style={{ margin: 0 }}>{title}</h2>
          {saveStatus !== "idle" && (
            <span style={{ fontSize: 12, opacity: 0.7 }}>
              {saveStatus === "saving" ? "Saving…" : saveStatus === "saved" ? "Saved" : "Not saved"}
            </span>
          )}
        </div>

        <button
          onClick={doneForNow}
          style={{ border: "none", background: "transparent", cursor: "pointer", opacity: 0.75 }}
        >
          I’m done for now
        </button>
      </div>

      <div style={{ marginTop: 12 }}>{children}</div>
    </div>
  );

  const Row: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap" }}>{children}</div>
  );

  type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" };

  const Button: React.FC<ButtonProps> = ({ variant = "primary", ...props }) => {
    const base: React.CSSProperties = {
      padding: "10px 14px",
      borderRadius: 10,
      cursor: "pointer",
      border: "1px solid #d0d0d0",
      background: variant === "primary" ? "#111" : "white",
      color: variant === "primary" ? "white" : "#111",
    };
    return <button {...props} style={base} />;
  };

  if (screen === SCREENS.ORIENTATION) {
    return (
      <Card title="One Small Step">
        <p style={{ marginTop: 0 }}>
          You don’t need to solve everything right now. We’re just finding one small step you’re willing to take next.
        </p>
        <p style={{ opacity: 0.8 }}>No pressure. No “best step.” Just something that feels possible.</p>
        <Row>
          <Button onClick={() => setScreen(SCREENS.CAPTURE)}>Continue</Button>
          <Button variant="secondary" onClick={doneForNow}>
            Not now
          </Button>
        </Row>
      </Card>
    );
  }

  if (screen === SCREENS.CAPTURE) {
    return (
      <Card title="Name your step">
        <p style={{ marginTop: 0, opacity: 0.85 }}>
          What’s one small step you’re willing to take next? It can be practical or simple. Even “make a coffee” counts.
        </p>

        <textarea
          value={stepText}
          onChange={(e) => setStepText(e.target.value)}
          placeholder="Type one small step…"
          rows={4}
          style={{ width: "100%", padding: 12, borderRadius: 10, border: "1px solid #d0d0d0", resize: "vertical" }}
        />

        <Row>
          <Button onClick={() => setScreen(SCREENS.ACK)}>That’s my step</Button>
          <Button variant="secondary" onClick={() => setScreen(SCREENS.ORIENTATION)}>
            Back
          </Button>
        </Row>
      </Card>
    );
  }

  if (screen === SCREENS.ACK) {
    const hasStep = normalizedStep.length > 0;

    return (
      <Card title="Acknowledgement">
        {hasStep ? (
          <>
            <p style={{ marginTop: 0, opacity: 0.85 }}>This is the step you chose:</p>
            <div style={{ padding: 12, borderRadius: 10, border: "1px solid #e5e5e5", background: "#fafafa" }}>
              {normalizedStep}
            </div>

            <p style={{ marginTop: 14, opacity: 0.85 }}>
              Does this belong to something you’re already working on in the Sanctuary?
            </p>
          </>
        ) : (
          <>
            <p style={{ marginTop: 0, opacity: 0.85 }}>
              You didn’t name a step — that’s okay. Sometimes the step is simply pausing.
            </p>
            <p style={{ opacity: 0.85 }}>We can close this gently.</p>
          </>
        )}

        <Row>
          {hasStep && <Button onClick={() => setScreen(SCREENS.PICK_PROJECT)}>Yes — take it to my project</Button>}

          <Button variant="secondary" onClick={() => setScreen(SCREENS.CLOSE)}>
            No — close for now
          </Button>

          <Button variant="secondary" onClick={() => setScreen(SCREENS.CAPTURE)}>
            Edit
          </Button>
        </Row>
      </Card>
    );
  }

  if (screen === SCREENS.PICK_PROJECT) {
    return (
      <Card title="Choose where this belongs">
        <p style={{ marginTop: 0, opacity: 0.85 }}>
          We’ll take this step to the right place so you can work on it with support.
        </p>

        <div style={{ marginTop: 12 }}>
          <label style={{ display: "block", marginBottom: 8, opacity: 0.85 }}>Select a project</label>

          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            style={{ padding: 10, borderRadius: 10, border: "1px solid #d0d0d0", width: "100%" }}
          >
            {PROJECTS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <Row>
          <Button
            onClick={() => {
              onGoToProject?.({ stepText: normalizedStep, projectId });
              setScreen(SCREENS.TRANSITION);
            }}
          >
            Continue
          </Button>

          <Button variant="secondary" onClick={() => setScreen(SCREENS.ACK)}>
            Back
          </Button>

          <Button variant="secondary" onClick={() => setScreen(SCREENS.CLOSE)}>
            Close for now
          </Button>
        </Row>
      </Card>
    );
  }

  if (screen === SCREENS.TRANSITION) {
    return (
      <Card title="Let’s go together">
        <p style={{ marginTop: 0, opacity: 0.85 }}>
          This step is now in the right place. You don’t have to hold it all in your head — we’ll work through it here,
          one piece at a time.
        </p>

        <Row>
          <Button onClick={() => setScreen(SCREENS.CLOSE)}>I’m ready to continue</Button>

          <Button variant="secondary" onClick={doneForNow}>
            Stop here for now
          </Button>
        </Row>
      </Card>
    );
  }

  return (
    <Card title="That’s enough for now">
      <p style={{ marginTop: 0, opacity: 0.85 }}>
        You can stop here. The shovel will be here when you want it — today can be spoon-day.
      </p>

      <Row>
        <Button onClick={() => onExit?.()}>Return to Sanctuary</Button>
        <Button variant="secondary" onClick={resetFlow}>
          Start again
        </Button>
      </Row>
    </Card>
  );
}

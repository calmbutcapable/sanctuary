import React from "react";

type HandoffChoice =
  | "one_small_step"
  | "clarity_check"
  | "coffee_time"
  | "done_for_now";

export function GentleHandoff({
  onChoose,
}: {
  onChoose: (choice: HandoffChoice) => void;
}) {
  return (
    <div style={{ maxWidth: 820, margin: "0 auto", padding: 24 }}>
      <h1 style={{ marginBottom: 8 }}>Take your time.</h1>
      <p style={{ marginTop: 0, opacity: 0.8 }}>
        You’ve arrived. Nothing is rushed here. Choose a direction — or stop here. That still counts.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 16,
          marginTop: 20,
        }}
      >
        <Card
          title="One Small Step"
          body="Choose one tiny action that makes tomorrow slightly easier."
          button="Choose a small step"
          variant="primary"
          onClick={() => onChoose("one_small_step")}
        />
        <Card
          title="Clarity Check"
          body="Dump the noise, then pull out what actually matters. Understanding before action."
          button="Get clarity"
          variant="secondary"
          onClick={() => onChoose("clarity_check")}
        />
        <Card
          title="Coffee Time"
          body="You’re allowed to rest. A short reset to protect your energy."
          button="Take a reset"
          variant="secondary"
          onClick={() => onChoose("coffee_time")}
        />
      </div>

      <div style={{ marginTop: 22, display: "flex", gap: 12, flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={() => onChoose("done_for_now")}
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            background: "transparent",
            color: "#ccc",
            border: "1px solid #444",
            cursor: "pointer",
          }}
        >
          Stop here — that still counts
        </button>

        <span style={{ alignSelf: "center", opacity: 0.7 }}>
          (The Sanctuary remembers direction, not performance.)
        </span>
      </div>
    </div>
  );
}

function Card({
  title,
  body,
  button,
  variant = "secondary",
  onClick,
}: {
  title: string;
  body: string;
  button: string;
  variant?: "primary" | "secondary";
  onClick: () => void;
}) {
  return (
    <div
      style={{
        border: "1px solid rgba(0,0,0,0.12)",
        borderRadius: 14,
        padding: 16,
        boxShadow: "0 6px 20px rgba(0,0,0,0.04)",
      }}
    >
      <h3 style={{ marginTop: 0, marginBottom: 8 }}>{title}</h3>
      <p style={{ marginTop: 0, opacity: 0.85, lineHeight: 1.4 }}>{body}</p>
     <button
        type="button"
        onClick={onClick}
        style={{
          marginTop: 8,
          padding: "10px 12px",
          borderRadius: 10,
          background: variant === "primary" ? "#2b6cb0" : "transparent",
          color: variant === "primary" ? "#fff" : "#ccc",
          border: variant === "primary" ? "none" : "1px solid #444",
          cursor: "pointer",
        }}
      >
        {button}
      </button>
    </div>
  );
}

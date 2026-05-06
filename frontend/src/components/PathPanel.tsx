import React from "react";

type Props = {
  message: string;
  primaryActionLabel: string;
  primaryAction: () => void;
  secondaryActionLabel: string;
  secondaryAction: () => void;
};

export default function PathPanel({
  message,
  primaryActionLabel,
  primaryAction,
  secondaryActionLabel,
  secondaryAction,
}: Props) {
  return (
    <div
      style={{
        padding: "1rem",
        borderRadius: 12,
        border: "1px solid #222",
        background: "#111",
        marginBottom: "1.5rem",
      }}
    >
      <p style={{ margin: 0, marginBottom: "0.75rem", fontSize: "1.05rem" }}>
        {message}
      </p>

      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        <button
          onClick={primaryAction}
          style={{
            padding: "0.6rem 1.2rem",
            borderRadius: 999,
            border: "none",
            background: "#2b6cb0",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          {primaryActionLabel}
        </button>

        <button
          onClick={secondaryAction}
          style={{
            padding: "0.6rem 1.2rem",
            borderRadius: 999,
            border: "1px solid #555",
            background: "transparent",
            color: "#ccc",
            cursor: "pointer",
          }}
        >
          {secondaryActionLabel}
        </button>
      </div>
    </div>
  );
}
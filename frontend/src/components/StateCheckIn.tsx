import React, { useState } from "react";

type Props = {
  onComplete: (mood: number, energy: number) => void;
};

export default function StateCheckIn({ onComplete }: Props) {
  const [mood, setMood] = useState<number | null>(null);
  const [energy, setEnergy] = useState<number | null>(null);

  const isReady = mood !== null && energy !== null;

  const pillStyle = (selected: boolean): React.CSSProperties => ({
    padding: "0.5rem 0.9rem",
    borderRadius: 999,
    border: selected ? "1px solid #63b3ed" : "1px solid #444",
    background: selected ? "rgba(43, 108, 176, 0.25)" : "transparent",
    color: selected ? "#fff" : "#ccc",
    cursor: "pointer",
    fontSize: "0.95rem",
    transform: selected ? "scale(1.05)" : "scale(1)",
    transition: "all 0.15s ease",
  });

  return (
    <div
      style={{
        padding: "1rem",
        borderRadius: 12,
        border: "1px solid #222",
        background: "#111",
      }}
    >
      <h3 style={{ marginTop: 0, marginBottom: "0.5rem" }}>Before you begin</h3>
      <p style={{ opacity: 0.78, marginTop: 0, marginBottom: "0.75rem", lineHeight: 1.5 }}>
        A quick check-in helps Sanctuary understand how you are arriving today.
      </p>
      <p style={{ opacity: 0.78, marginTop: 0, marginBottom: "0.75rem", lineHeight: 1.5 }}>
        Your mood and energy can affect how work feels. Some days you may be
        ready to push forward; other days smaller, calmer steps can help you
        keep moving.
      </p>
      <p style={{ opacity: 0.72, marginTop: 0, marginBottom: "1rem", lineHeight: 1.5 }}>
        There is no right answer. This is here to support you, not judge you.
      </p>

      <div style={{ marginBottom: "1rem" }}>
        <div style={{ marginBottom: "0.5rem", opacity: 0.85 }}>Mood</div>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setMood(value)}
              style={pillStyle(mood === value)}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <div style={{ marginBottom: "0.5rem", opacity: 0.85 }}>Energy</div>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setEnergy(value)}
              style={pillStyle(energy === value)}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        disabled={!isReady}
        onClick={() => {
          if (mood !== null && energy !== null) {
            onComplete(mood, energy);
          }
        }}
        style={{
          padding: "0.6rem 1.2rem",
          borderRadius: 999,
          border: "none",
          background: isReady ? "#2b6cb0" : "#444",
          color: "#fff",
          fontSize: "1rem",
          cursor: isReady ? "pointer" : "not-allowed",
          opacity: isReady ? 1 : 0.7,
        }}
      >
        Continue
      </button>
    </div>
  );
}
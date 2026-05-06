import React, { useMemo, useState } from "react";


type Step = "arrival" | "unload" | "reflect" | "done";

function safeTrim(s: string) {
  return (s || "").replace(/\s+/g, " ").trim();
}

// Very lightweight “noise reduction” (not NLP magic, just useful structure).
function extractThemes(text: string): string[] {
  const cleaned = safeTrim(text);
  if (!cleaned) return [];

  const t = cleaned.toLowerCase();


  const themes = new Set<string>();
  const add = (label: string, patterns: RegExp[]) => {
    if (patterns.some((p) => p.test(t))) themes.add(label);
  };

  add("Overwhelm / too much at once", [/overwhelm/, /too much/, /swamped/, /flooded/, /drowning/]);
  add("Loneliness / disconnection", [/lonely/, /alone/, /isolat/, /no one/, /disconnected/]);
  add("Stress / anxiety", [/anxious/, /anxiety/, /panic/, /stress/, /on edge/]);
  add("Low motivation / fog", [/no motivation/, /can.?t focus/, /fog/, /flat/, /tired/, /exhaust/]);
  add("Decision pressure", [/decision/, /choose/, /stuck/, /can.?t decide/, /paralys/]);
  add("Work / money pressure", [/work/, /job/, /deadline/, /money/, /bills/]);
  add("Relationships", [/relationship/, /partner/, /family/, /friend/, /mum/, /dad/]);
  add("Health / pain", [/pain/, /ill/, /health/, /clinic/, /physio/]);

  // Keep it short and calm.
return Array.from(themes).slice(0, 4);
}

function makeReflection(text: string) {
  const cleaned = safeTrim(text);
  const themes = extractThemes(cleaned);

  // Gentle summary: reflect without “diagnosing”.
  let summary = "Here’s what I’m hearing, stripped of noise:";
  if (!cleaned) summary = "I don’t have any text to reflect back yet.";

  // Tiny heuristic for a 1–2 sentence reflection:
  const firstSentence = cleaned.split(/[.!?]\s/)[0]?.slice(0, 180);
  const reflection =
    cleaned.length > 0
      ? `${summary} You’re carrying a lot right now. ${firstSentence ? `The main thread seems to be: “${firstSentence}”.` : ""}`
      : summary;

  return { themes, reflection };
}

export default function SanctuaryEntranceFlow({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState<Step>("arrival");
  const [unloadText, setUnloadText] = useState("");
  const canContinueFromUnload = safeTrim(unloadText).length >= 3;
  const [saved, setSaved] = useState(false);

  const { themes, reflection } = useMemo(() => makeReflection(unloadText), [unloadText]);
  const cleaned = safeTrim(unloadText);
  const lower = cleaned.toLowerCase();
  const mentionsTired = /\b(tired|weary|exhaust(ed)?|worn out|fatigue|drained)\b/.test(lower);

// Sanctuary rule: if a user shares something personal, we don't answer generically.
// Echo first (before orientation or options) to show their words were seen — no interpretation, judgement, or pressure.

  const echo =
    cleaned.length === 0
      ? "You didn’t write anything this time."
      : mentionsTired
      ? "You said you’re feeling tired."
      : cleaned.length < 25
      ? "You wrote a short check-in."
      : "You wrote a few thoughts down.";


  const btn: React.CSSProperties = {
    padding: "10px 14px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.22)",
    background: "rgba(255,255,255,0.08)",
    color: "rgba(255,255,255,0.92)",
    cursor: "pointer",
};

  const btnDisabled: React.CSSProperties = {
    ...btn,
    background: "rgba(255,255,255,0.03)",
    color: "rgba(255,255,255,0.35)",
    border: "1px solid rgba(255,255,255,0.12)",
    cursor: "not-allowed",
};

  const saveLocal = () => {
    try {
      const payload = {
        createdAt: new Date().toISOString(),
        unloadText: safeTrim(unloadText),
        themes,
        reflection,
      };
      localStorage.setItem("sanctuary:first10", JSON.stringify(payload));
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } catch {
      // silently ignore (privacy-first, no drama)
    }
  };

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: 16, lineHeight: 1.5 }}>
      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: 16,
          padding: 18,
          boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <h2 style={{ margin: 0 }}>The Sanctuary</h2>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 12, opacity: 0.75 }}>First 10 minutes</span>
            <span style={{ fontSize: 12, opacity: 0.6 }}>
              {step === "arrival" && "Arrival"}
              {step === "unload" && "Unload"}
              {step === "reflect" && "First small win"}
              {step === "done" && "Done"}
            </span>
          </div>
        </div>

        {step === "arrival" && (
          <>
            <p style={{ marginTop: 12 }}>
              The Sanctuary is here to help you move forward with things that matter to you,
              without pushing yourself to the point of burnout.
            </p>
            <p style={{ opacity: 0.85 }}>
              You choose the goal. It helps you take small, sensible steps that fit your
              life as it really is.
            </p>
            <p style={{ opacity: 0.85 }}>

              If things become difficult, it helps you slow down and adjust rather than
              give up. This isn’t about pressure or perfection — it’s about keeping going
              safely and feeling more in control.
            </p>

            <button 
              onClick={() => setStep("unload")}
              style={btn}
            >
              Start (slowly)
            </button>
            </>
          )}

        {step === "unload" && (
          <>
            <p style={{ marginTop: 12 }}>
              Put down what you’re carrying. Messy is fine.
            </p>
            <p style={{ opacity: 0.85, marginTop: -6 }}>
              No structure. No perfect wording. Just type what’s swirling.
            </p>
            <textarea
              value={unloadText}
              onChange={(e) => setUnloadText(e.target.value)}
              placeholder="What’s going on for you right now?"
              rows={7}
              style={{
                width: "100%",
                marginTop: 10,
                padding: 12,
                borderRadius: 12,
                border: "1px solid #ccc",
                resize: "vertical",
                fontFamily: "inherit",
              }}
            />
            
            <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
              <button onClick={() => setStep("arrival")} style={btn}>
                Back
              </button>

              <button
                onClick={() => setStep("reflect")}
                disabled={!canContinueFromUnload}
                style={canContinueFromUnload ? btn : btnDisabled}
                title={!canContinueFromUnload ? "A word or two is enough." : ""}
              >
                Continue
              </button>
            </div>
          </>
        )}

        {step === "reflect" && (
          <>
            <p style={{ marginTop: 12 }}>
              Here’s the first small win: clarity without pressure.
            </p>
            <p style={{ marginTop: 10, opacity: 0.9 }}>
              {echo}
            </p>

            <div
              style={{
                marginTop: 10,
                padding: 14,
                borderRadius: 12,
                border: "1px solid #eee",
                background: "#fafafa",
                color: "#111",      // ← this is the key
              }}
            >
              {/* Orient – always shown */}
              <div style={{ fontSize: 13, marginBottom: 8 }}>
                No need to fix anything right now — just noticing what’s there.
            </div>

              {/* Conditional content */}
              {themes.length > 0 ? (
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  {themes.map((th) => (
                    <li key={th}>{th}</li>
                  ))}
                </ul>
              ) : (
              <div style={{ fontSize: 13, color: "#999" }}>
                  No clear themes surfaced — and that’s okay.
              </div>
              )}
              </div>   {/* ← CLOSE THE WHITE CARD HERE */}

            <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
              <button
                onClick={() => setStep("unload")}
                style={btn}
              >
                Edit what I wrote
              </button>

              <button
                onClick={saveLocal}
                style={btn}
              >
                Save this moment
              </button>

              <button
                // reflect screen Finish
                  onClick={() => setStep("done")}
                  style={btn}
              >
                  Finish
              </button>


              {saved && <span style={{ fontSize: 12, opacity: 0.75, alignSelf: "center" }}>Saved.</span>}
            </div>
          </>
        )}

        {step === "done" && (
          <>
            <p style={{ marginTop: 12 }}>
              That’s enough for now.
            </p>
            <p style={{ opacity: 0.85, marginTop: -6 }}>
              The goal wasn’t to solve everything. The goal was to make things feel less tangled.
            </p>
            <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
              
              <button
                onClick={() => setStep("arrival")}
                style={btn}
              >
                Restart flow
              </button>
              <button
                onClick={() => setStep("unload")}
                style={btn}
              >
                Write more
              </button>

               <button
        onClick={() => onFinish?.()}
        style={btn}
      >
        Continue
      </button>
            </div>
          </>
        )}
      </div>

      <div style={{ marginTop: 10, fontSize: 12, opacity: 0.65 }}>
        Note: This is reflective support, not medical or crisis support. If you feel unsafe or need urgent help, seek immediate support from trusted people or professional services.
      </div>
    </div>
  );
}

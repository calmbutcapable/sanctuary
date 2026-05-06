import React from "react";
import {
  WeeklyReflection,
  ReflectionOut,
  generateAIReflection,
} from "../api/client";

type ReflectionsViewProps = {
  loadingReflection: boolean;
  weeklyReflection: WeeklyReflection | null;
  reflectionSuggestions: ReflectionOut[];
};

function ReflectionSection({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  if (!items.length) return null;

  return (
    <div style={{ marginTop: "1.25rem" }}>
      <h3 style={{ marginBottom: "0.5rem" }}>{title}</h3>
      <ul style={{ margin: 0, paddingLeft: "1.25rem", display: "grid", gap: 8 }}>
        {items.map((item, index) => (
          <li key={`${title}-${index}`} style={{ lineHeight: 1.6 }}>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ReflectionsView({
  loadingReflection,
  weeklyReflection,
  reflectionSuggestions,
}: ReflectionsViewProps) {
  const [aiReflection, setAiReflection] = React.useState<any>(null);
  const [loadingAI, setLoadingAI] = React.useState(false);
  const [reflectionResponse, setReflectionResponse] = React.useState("");
  const [saveMessage, setSaveMessage] = React.useState("");

  const reflectionStorageKey = weeklyReflection?.daily?.[0]?.date
    ? `reflectionResponse-${weeklyReflection.daily[0].date}`
    : "reflectionResponse";
  const aiReflectionStorageKey =
  weeklyReflection?.daily?.[0]?.date
    ? `aiReflection-${weeklyReflection.daily[0].date}`
    : "aiReflection";

  React.useEffect(() => {
    const saved = localStorage.getItem(reflectionStorageKey);
    setReflectionResponse(saved ?? "");
  }, [reflectionStorageKey]);

  React.useEffect(() => {
  const saved = localStorage.getItem(aiReflectionStorageKey);

  if (!saved) {
    setAiReflection(null);
    return;
  }

  try {
    setAiReflection(JSON.parse(saved));
  } catch {
    setAiReflection(null);
  }
}, [aiReflectionStorageKey]);

  const maxEntries =
    weeklyReflection && weeklyReflection.daily.length > 0
      ? Math.max(...weeklyReflection.daily.map((d) => d.entry_count))
      : 1;

  async function handleGenerateReflection() {
  if (loadingAI) return;

  try {
    setLoadingAI(true);
    const data = await generateAIReflection();
    setAiReflection(data);
    localStorage.setItem(aiReflectionStorageKey, JSON.stringify(data));
  } catch (err) {
    console.error("AI reflection error:", err);
  } finally {
    setLoadingAI(false);
  }
}

  const helping: string[] = [];
  const gettingInWay: string[] = [];
  const suggestions: string[] = [];
  const prompts: string[] = [];

  if (reflectionSuggestions?.length) {
  reflectionSuggestions.forEach((item) => {
    if (item.message) {
      suggestions.push(item.message);
    }
  });
}

   if (Array.isArray(aiReflection?.patterns)) {
  aiReflection.patterns.forEach((pattern: any) => {
    if (pattern?.type === "helping" && pattern?.description) {
      helping.push(pattern.description);
    } else if (pattern?.type === "blocking" && pattern?.description) {
      gettingInWay.push(pattern.description);
    } else if (pattern?.description) {
      // fallback safety
      gettingInWay.push(pattern.description);
    } else if (typeof pattern === "string") {
      gettingInWay.push(pattern);
    }
  });
}

  if (Array.isArray(aiReflection?.prompts)) {
    aiReflection.prompts.forEach((prompt: string) => {
      prompts.push(prompt);
    });
  }

const hasEnoughData =
  (weeklyReflection?.total_entries ?? 0) > 0 ||
  Boolean(aiReflection);

  return (
    <section>
      <h2 style={{ marginTop: 0 }}>Reflections</h2>

      <p style={{ opacity: 0.8, fontSize: "1.1rem" }}>
        Reflections are based on your recent notes, check-ins, and activity.
        The more you put in, the more useful Sanctuary can be.
      </p>
      {(aiReflection?.summary || weeklyReflection?.summary) && (
        <div
          style={{
            marginTop: "1rem",
            marginBottom: "1rem",
            padding: "1rem",
            borderRadius: 10,
            border: "1px solid #222",
            background: "#111",
            lineHeight: 1.6,
          }}
        >
          {aiReflection?.summary || weeklyReflection?.summary}
        </div>
      )}

      {loadingReflection ? (
        <p style={{ opacity: 0.7 }}>Loading reflections...</p>
      ) : !hasEnoughData ? (
        <div
          style={{
            marginTop: "1rem",
            padding: "1rem",
            borderRadius: 10,
            border: "1px solid #222",
            background: "#111",
          }}
        >
          <p style={{ marginTop: 0 }}>
            There is not enough information yet to reflect meaningful patterns back.
          </p>
          <p style={{ marginBottom: 0, opacity: 0.8 }}>
            Use check-ins and session notes regularly if you want Sanctuary to become
            more useful over time.
          </p>
        </div>
      ) : (
        <>
          <ReflectionSection title="What’s been helping" items={helping} />
          <ReflectionSection title="What’s been getting in the way" items={gettingInWay} />
          <ReflectionSection title="Suggestions for next time" items={suggestions} />
          <ReflectionSection title="Something to think about" items={prompts} />
        </>
      )}

      <div style={{ marginTop: "1.5rem" }}>
        <button
          onClick={handleGenerateReflection}
          disabled={loadingAI}
          style={{
            padding: "0.6rem 1.2rem",
            borderRadius: 999,
            border: "none",
            background: "#2b6cb0",
            color: "white",
            cursor: "pointer",
          }}
        >
          {loadingAI ? "Reflecting…" : "Generate reflection"}
        </button>
      </div>

      <div style={{ marginTop: "1.5rem" }}>
        <h3>Your response</h3>
        <textarea
          className="sanctuary-textarea"
          value={reflectionResponse}
          onChange={(e) => setReflectionResponse(e.target.value)}
          rows={6}
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.2)",
            background: "rgba(0,0,0,0.2)",
            color: "inherit",
            fontSize: "1rem",
            lineHeight: 1.6,
            resize: "vertical",
          }}
        />

        <div style={{ marginTop: "0.75rem", display: "flex", gap: "0.5rem" }}>
          <button
            onClick={() => {
              localStorage.setItem(reflectionStorageKey, reflectionResponse);
              setSaveMessage("Saved");
              window.setTimeout(() => setSaveMessage(""), 1500);
            }}
            style={{
              padding: "0.6rem 1.2rem",
              borderRadius: 999,
              border: "none",
              background: "#2b6cb0",
              color: "white",
              cursor: "pointer",
            }}
          >
            Save response
          </button>

          {saveMessage && (
            <span style={{ alignSelf: "center", opacity: 0.8 }}>{saveMessage}</span>
          )}
        </div>
      </div>
    </section>
  );
}
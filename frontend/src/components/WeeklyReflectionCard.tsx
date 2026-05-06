// src/components/WeeklyReflectionCard.tsx
import React from "react";
import { getWeeklyReflection, WeeklyReflection } from "../api/reflections";

export function WeeklyReflectionCard() {
  const [data, setData] = React.useState<WeeklyReflection | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getWeeklyReflection();
        if (!cancelled) setData(res);
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Unknown error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <div style={{ padding: 16 }}>Loading weekly reflection…</div>;

  if (error) {
    return (
      <div style={{ padding: 16 }}>
        <div style={{ marginBottom: 8, fontWeight: 700 }}>Weekly Reflection</div>
        <div style={{ opacity: 0.85 }}>Error: {error}</div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div style={{ padding: 16, border: "1px solid #222", borderRadius: 12 }}>
      <div style={{ fontWeight: 800, marginBottom: 12 }}>Weekly Reflection</div>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 12 }}>
        <Stat label="Total entries" value={data.total_entries} />
        <Stat label="Active days" value={data.active_days} />
        <Stat label="Empty days" value={data.empty_days} />
      </div>

      <div style={{ marginBottom: 12, opacity: 0.95, whiteSpace: "pre-wrap" }}>
        {data.summary || "No summary yet."}
      </div>

      {data.prompts?.length ? (
        <>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Prompts</div>
          <ul style={{ margin: 0, paddingLeft: 18, opacity: 0.95 }}>
            {data.prompts.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ minWidth: 140 }}>
      <div style={{ fontSize: 12, opacity: 0.75 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 800 }}>{value}</div>
    </div>
  );
}
import React from "react";
import StateCheckIn from "./StateCheckIn";
import { JournalEntry, Memory, ResumeResponse, getResume } from "../api/client";
import { HomeRecommendation } from "../lib/homeRecommendation";

function formatActionLabel(action: string): string {
  switch (action) {
    case "checkin":
      return "Start with a check-in";
    case "reflect":
      return "Take a reflection pause";
    case "journal":
      return "Write in your journal";
    case "continue_thread":
      return "Continue your current thread";
    case "workspace":
      return "Open your workspace";
    case "pause":
      return "Pause for now";
    default:
      return "Take the next step";
  }
}

type HomeViewProps = {
  stateCheckInComplete: boolean;
  setCurrentMood: (value: number | null) => void;
  setCurrentEnergy: (value: number | null) => void;
  setStateCheckInComplete: (value: boolean) => void;
  homeMessage: string;
  lastHandoff: { choice: string } | null;
  prettyChoice: (choice: string) => string;
  homeSummary: any;
  setWorkspaceThreadId: (id: number) => void;
  setViewPersist: (view: any) => void;
  latestJournal: JournalEntry | null;
  checkIns: Memory[];
  handleDeleteMemory: (id: number) => void;
  homeRecommendation: HomeRecommendation;
  justCheckedIn: boolean;
  clearJustCheckedIn: () => void;
  openWorkspace: () => void;
};

export default function HomeView({
  stateCheckInComplete,
  setCurrentMood,
  setCurrentEnergy,
  setStateCheckInComplete,
  justCheckedIn,
  clearJustCheckedIn,
  lastHandoff,
  prettyChoice,
  homeSummary,
  setWorkspaceThreadId,
  setViewPersist,
  latestJournal,
  checkIns,
  handleDeleteMemory,
  homeRecommendation,
  openWorkspace,
}: HomeViewProps) {
  const [resume, setResume] = React.useState<ResumeResponse | null>(null);

  React.useEffect(() => {
    getResume()
      .then(setResume)
      .catch(() => {});
  }, []);

  function handleRecommendationClick() {
    switch (homeRecommendation.primaryAction) {
      case "workspace":
        openWorkspace();
        break;
      case "checkin":
        setViewPersist("checkin");
        break;
      case "journal":
        setViewPersist("journals");
        break;
      case "reflect":
        setViewPersist("reflections");
        break;
      case "continue_thread":
        if (homeSummary?.active_threads?.length > 0) {
          setWorkspaceThreadId(homeSummary.active_threads[0].thread_id);
          openWorkspace();
        }
        break;
      case "pause":
        setViewPersist("handoff");
        break;
      default:
        break;
    }
  }

  return (
    <section>
      <h2 style={{ marginTop: 0 }}>Welcome to Sanctuary</h2>
      <p style={{ opacity: 0.85, fontSize: "1.1rem", lineHeight: 1.6 }}>
        Sanctuary helps you work through projects step by step, without having
        to hold everything in your head at once.
      </p>

      <p style={{ opacity: 0.85, fontSize: "1.05rem", lineHeight: 1.6 }}>
        Ask your guide, Rook, as many questions as you like about each stage of
        your project. He is here to help you learn, understand, and enjoy
        completing your work.
      </p>

      <div
        style={{
          marginTop: "1rem",
          marginBottom: "1.25rem",
          padding: "1rem",
          borderRadius: 12,
          border: "1px solid #2b6cb0",
          background: "rgba(43, 108, 176, 0.14)",
        }}
      >
        <h3 style={{ marginTop: 0, marginBottom: "0.5rem" }}>
          Start with a project
        </h3>
        <p style={{ opacity: 0.85, marginTop: 0, lineHeight: 1.5 }}>
          Create a project and Sanctuary will help you break it into manageable
          steps. Work through each step to gradually build your final project.
        </p>
        <button
          onClick={openWorkspace}
          style={{
            padding: "0.6rem 1rem",
            borderRadius: 999,
            border: "none",
            background: "#2b6cb0",
            color: "#fff",
            fontSize: "1rem",
            cursor: "pointer",
          }}
        >
          Create or open a project
        </button>
      </div>

      {justCheckedIn && (
        <div
          style={{
            marginBottom: "1rem",
            padding: "0.85rem 1.1rem",
            borderRadius: 10,
            border: "1px solid #2b6cb0",
            background: "rgba(43, 108, 176, 0.15)",
            color: "#e6f0ff",
            fontSize: "1rem",
            fontWeight: 500,
          }}
        >
          Check-in saved. You’re ready to start a project in your workspace.
        </div>
      )}

      {!stateCheckInComplete && (
        <div
          style={{
            marginTop: "1rem",
            marginBottom: "1.5rem",
            padding: "1rem",
            borderRadius: 12,
            border: "1px solid #222",
            background: "#111",
          }}
        >
          <h3 style={{ marginTop: 0 }}>Before you begin</h3>
          <p style={{ opacity: 0.8, lineHeight: 1.5 }}>
            A quick check-in can help Sanctuary understand how you are arriving
            today. It is here to support your session, not to judge it.
          </p>
          <StateCheckIn
            onComplete={(mood, energy) => {
              setCurrentMood(mood);
              setCurrentEnergy(energy);
              setStateCheckInComplete(true);
            }}
          />
        </div>
      )}

        <>
          <div
            style={{
              marginBottom: "1rem",
              padding: "0.9rem 1rem",
              borderRadius: 10,
              border: "1px solid #222",
              background: "#111",
            }}
          >
            <div
              style={{
                fontSize: "0.95rem",
                opacity: 0.7,
                marginBottom: "0.35rem",
              }}
            >
              A suggested next step
            </div>
            <div
              style={{
                fontSize: "1.05rem",
                fontWeight: 600,
                marginBottom: "0.35rem",
              }}
            >
              {formatActionLabel(homeRecommendation.primaryAction)}
            </div>
            <div style={{ opacity: 0.8 }}>{homeRecommendation.reason}</div>
            <div style={{ marginTop: "0.75rem" }}>
              <button
                onClick={handleRecommendationClick}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: 999,
                  border: "none",
                  background: "#2b6cb0",
                  color: "#fff",
                  fontSize: "0.95rem",
                  cursor: "pointer",
                }}
              >
                {formatActionLabel(homeRecommendation.primaryAction)}
              </button>
            </div>
          </div>

          {lastHandoff && (
            <p style={{ opacity: 0.7, marginTop: "0.5rem" }}>
              Last time you chose:{" "}
              <strong>{prettyChoice(lastHandoff.choice)}</strong>.
            </p>
          )}

          <div style={{ marginTop: "1.5rem" }}>
            <h3 style={{ marginBottom: "0.5rem" }}>
              Continue where you left off
            </h3>

            {resume && resume.source !== "empty" && (
              <div
                style={{
                  marginBottom: "1rem",
                  padding: "0.85rem 1rem",
                  borderRadius: 8,
                  border: "1px solid #222",
                  background: "#111",
                }}
              >
                {resume.source === "handoff" && (
                  <>
                    <div
                      style={{
                        fontSize: "0.95rem",
                        opacity: 0.7,
                        marginBottom: "0.35rem",
                      }}
                    >
                      Last completed
                    </div>
                    <div
                      style={{
                        fontSize: "1.02rem",
                        fontWeight: 600,
                        marginBottom: "0.5rem",
                      }}
                    >
                      {resume.last_completed_text}
                    </div>

                    {resume.suggested_next_options?.length ? (
                      <div style={{ opacity: 0.85 }}>
                        <div style={{ marginBottom: "0.35rem" }}>
                          Best next options:
                        </div>
                        <ul style={{ margin: 0, paddingLeft: "1.2rem" }}>
                          {resume.suggested_next_options.map((opt) => (
                            <li key={opt}>{opt}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </>
                )}

                {resume.source === "meaningful_action" && (
                  <>
                    <div
                      style={{
                        fontSize: "0.95rem",
                        opacity: 0.7,
                        marginBottom: "0.35rem",
                      }}
                    >
                      Last action
                    </div>
                    <div style={{ fontSize: "1.02rem", fontWeight: 600 }}>
                      {resume.label}
                    </div>
                    {resume.next_open_step && (
                      <div style={{ marginTop: "0.5rem", opacity: 0.85 }}>
                        Next step: {resume.next_open_step}
                      </div>
                    )}
                  </>
                )}

                {resume.source === "active_work" && (
                  <>
                    <div
                      style={{
                        fontSize: "0.95rem",
                        opacity: 0.7,
                        marginBottom: "0.35rem",
                      }}
                    >
                      Active work
                    </div>
                    <div style={{ fontSize: "1.02rem", fontWeight: 600 }}>
                      {resume.thread_title ?? "Your current thread"}
                    </div>
                    {resume.next_open_step && (
                      <div style={{ marginTop: "0.5rem", opacity: 0.85 }}>
                        Next step: {resume.next_open_step}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {homeSummary?.active_threads?.length > 0 ? (
              <div style={{ display: "grid", gap: "0.75rem" }}>
                {homeSummary.active_threads.map((thread: any) => (
                  <div
                    key={thread.thread_id}
                    onClick={() => {
                      setWorkspaceThreadId(thread.thread_id);
                      setViewPersist("workspace");
                    }}
                    style={{
                      padding: "0.75rem 1rem",
                      borderRadius: 8,
                      border: "1px solid #222",
                      background: "#111",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ fontSize: "1.05rem", fontWeight: 600 }}>
                      {!thread.title || thread.title.trim() === ""
                        ? "Untitled thread"
                        : thread.title}
                    </div>
                    <div style={{ marginTop: "0.35rem", opacity: 0.8 }}>
                      Next step: {thread.next_step?.title ?? "No open step"}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ opacity: 0.7, fontSize: "1.1rem" }}>
                No active threads yet.
              </p>
            )}
          </div>

          {latestJournal && (
            <div style={{ marginTop: "1.5rem" }}>
              <h3 style={{ marginBottom: "0.5rem" }}>Your thinking space</h3>
              <p style={{ opacity: 0.9, fontSize: "1rem", lineHeight: 1.6 }}>Use your journal to clear mental clutter, capture ideas, or notice what is helping you make progress.</p>
              <div
                style={{
                  padding: "0.75rem 1rem",
                  borderRadius: 8,
                  border: "1px solid #222",
                  background: "#111",
                }}
              >
                <div
                  style={{
                    fontSize: "0.95rem",
                    opacity: 0.6,
                    marginBottom: "0.35rem",
                  }}
                >
                  {new Date(latestJournal.created_at).toLocaleString()}
                </div>
                <div style={{ fontSize: "1.05rem", whiteSpace: "pre-wrap" }}>
                  {latestJournal.content.length > 220
                    ? `${latestJournal.content.slice(0, 220)}…`
                    : latestJournal.content}
                </div>

                <div style={{ marginTop: "0.75rem" }}>
                  <button
                    onClick={() => setViewPersist("journals")}
                    style={{
                      padding: "0.5rem 1rem",
                      borderRadius: 999,
                      border: "1px solid #555",
                      background: "transparent",
                      color: "#ccc",
                      fontSize: "0.95rem",
                      cursor: "pointer",
                    }}
                  >
                    Open journal
                  </button>
                </div>
              </div>
            </div>
          )}

          <h3 style={{ marginTop: "1.5rem" }}>Check-ins</h3>
          <p style={{ opacity: 0.9, fontSize: "1rem", lineHeight: 1.6 }}>Being honest about your mood and energy helps Sanctuary support the way you work today. Some days need a push; some days need smaller, calmer steps.</p>

          {checkIns.length <= 1 ? (
            <p style={{ opacity: 0.7, fontSize: "0.9rem" }}>
              Your recent check-ins will appear here.
            </p>
          ) : (
            checkIns.slice(0, 5).map((m) => (
              <article
                key={m.id}
                style={{
                  padding: "0.75rem 1rem",
                  borderRadius: 8,
                  border: "1px solid #222",
                  background: "#111",
                  marginBottom: "0.75rem",
                }}
              >
                <div
                  style={{
                    fontSize: "0.95rem",
                    opacity: 0.6,
                    marginBottom: "0.35rem",
                  }}
                >
                  {new Date(m.created_at).toLocaleString()}
                </div>

                <div style={{ fontSize: "1.05rem", whiteSpace: "pre-wrap" }}>
                  {m.raw_text}
                </div>

                <div style={{ marginTop: "0.75rem", textAlign: "right" }}>
                  <button
                    onClick={() => handleDeleteMemory(m.id)}
                    style={{
                      padding: "0.25rem 0.6rem",
                      borderRadius: 999,
                      border: "1px solid #555",
                      background: "transparent",
                      color: "#bbb",
                      fontSize: "1.1rem",
                      cursor: "pointer",
                    }}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))
          )}
        </>
    </section>
  );
}
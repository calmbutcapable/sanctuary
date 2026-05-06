import StateCheckIn from "./components/StateCheckIn";
import SanctuaryEntranceFlow from "./components/SanctuaryEntranceFlow";

import React, { useCallback, useEffect, useState } from "react";

import { GentleHandoff } from "./GentleHandoff";

import "./App.css";

import { logout, validateToken } from "./api/auth";

import Login from "./components/Login";
import TeacherDashboard from "./components/TeacherDashboard";
import JournalsView from "./components/JournalsView";
import ReflectionsView from "./components/ReflectionsView";
import HomeView from "./components/HomeView";
import { getHomeRecommendation } from "./lib/homeRecommendation";
import ProjectWorkspace from "./components/ProjectWorkspace";
import SanctuaryEntryScreen from "./components/SanctuaryEntryScreen";

import {
  getProfile,
  getRecentMemories,
  getHomeSummary,
  createMemory,
  deleteMemory,
  Profile,
  getWeeklyReflection,
  Memory,
  WeeklyReflection,
  getJournalEntries,
  createJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
  JournalEntry,
  Plan,
  getThreads,
  createThread,
} from "./api/client";

import ThreadWorkspace from "./components/ThreadWorkspace";

const HANDOFF_KEY = "sanctuary:last_handoff_choice";

type SavedHandoff = { choice: string; at: string };

function loadHandoffChoice(): SavedHandoff | null {
  try {
    const raw = localStorage.getItem(HANDOFF_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as SavedHandoff;
    if (!parsed?.choice || !parsed?.at) return null;

    return parsed;
  } catch {
    return null;
  }
}

function saveHandoffChoice(choice: string) {
  const payload: SavedHandoff = { choice, at: new Date().toISOString() };
  try {
    localStorage.setItem(HANDOFF_KEY, JSON.stringify(payload));
  } catch {
    // ignore
  }
}

function prettyChoice(choice: string) {
  return choice
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

type View =
  | "home"
  | "checkin"
  | "journals"
  | "reflections"
  | "handoff"
  | "entrance"
  | "workspace"
  | "projectWorkspace"
  | "firstSteps"
  | "admin"
  | "teacher";


const ONBOARDING_KEY = "sanctuary:onboardingComplete";
const LAST_VIEW_KEY = "sanctuary:last_view";
const LAST_HOME_DATE_KEY = "sanctuary:last_home_date";
const LAST_CHECKIN_DATE_KEY = "sanctuary:last_checkin_date";


type SessionCheckInPromptProps = {
  stateCheckInComplete: boolean;
  setCurrentMood: (value: number | null) => void;
  setCurrentEnergy: (value: number | null) => void;
  setStateCheckInComplete: (value: boolean) => void;
};

function SessionCheckInPrompt({
  stateCheckInComplete,
  setCurrentMood,
  setCurrentEnergy,
  setStateCheckInComplete,
}: SessionCheckInPromptProps) {
  if (stateCheckInComplete) return null;

  return (
    <div
      style={{
        marginBottom: "1.25rem",
        padding: "1rem",
        borderRadius: 10,
        border: "1px solid #222",
        background: "#111",
      }}
    >
      <div style={{ fontSize: "0.95rem", opacity: 0.7, marginBottom: "0.35rem" }}>
        Before you continue
      </div>
      <div style={{ fontSize: "1.05rem", fontWeight: 600, marginBottom: "0.5rem" }}>
        Take a quick state check
      </div>
      <div style={{ opacity: 0.8, marginBottom: "0.9rem" }}>
        This helps Sanctuary respond more helpfully to how you’re arriving today.
      </div>

      <StateCheckIn
  onComplete={(mood, energy) => {
    const today = new Date().toISOString().slice(0, 10);
    localStorage.setItem(LAST_CHECKIN_DATE_KEY, today);

    setCurrentMood(mood);
    setCurrentEnergy(energy);
    setStateCheckInComplete(true);
  }}
/>
    </div>
  );
}

function App() {
  
  const [workspaceThreadId, setWorkspaceThreadId] = useState<number | null>(null);
  const [activeProject, setActiveProject] = useState<Plan | null>(null);

  const [view, setView] = useState<View>(() => {
  try {
    const done = localStorage.getItem(ONBOARDING_KEY) === "1";
    if (!done) return "firstSteps";

    const today = new Date().toISOString().slice(0, 10);
const last = localStorage.getItem(LAST_VIEW_KEY) as View | null;

const allowed: View[] = [
  "home",
  "checkin",
  "journals",
  "reflections",
  "handoff",
  "entrance",
  "workspace",
  "projectWorkspace",
  "firstSteps",
  "admin",
  "teacher",
];

if (last && allowed.includes(last)) {
  localStorage.setItem(LAST_HOME_DATE_KEY, today);
  return last;
}

const lastHomeDate = localStorage.getItem(LAST_HOME_DATE_KEY);

if (lastHomeDate !== today) {
  localStorage.setItem(LAST_HOME_DATE_KEY, today);
  return "home";
}

return "home";
  } catch {
    return "entrance";
  }
});

  const handleLogout = async () => {
  try {
    await logout();
  } catch (e) {
    // ignore backend/logout errors
  }

  localStorage.removeItem("token");
  localStorage.removeItem("sanctuary:last_view");
  localStorage.removeItem("sanctuary:onboardingComplete");

  setProfile(null);
  setMemories([]);
  setHomeSummary(null);
  setJournalEntries([]);
  setWeeklyReflection(null);
  setToken(null);

  setView("entrance");
};

    const handleStartEditJournal = (entry: JournalEntry) => {
      setJournalText(entry.content);
      setEditingJournalId(entry.id);
    };

    const handleCancelEditJournal = () => {
      setEditingJournalId(null);
    };

function setViewPersist(next: View) {
  setView(next);
  try {
    if (next !== "entrance") {
      localStorage.setItem(LAST_VIEW_KEY, next);
    }
  } catch {
    // ignore
  }
}
async function openWorkspace() {
  try {
    const threads = await getThreads();
    let thread = threads[0];

    if (!thread) {
      thread = await createThread({
        title: "Sanctuary Project",
        thread_type: "project",
        description: "Main project workspace",
      });
    }

    setWorkspaceThreadId(thread.id);
    setViewPersist("workspace");
  } catch (err) {
    console.error(err);
    setError("Could not open your workspace.");
  }
}
  // ...rest of your state
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [homeSummary, setHomeSummary] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkInText, setCheckInText] = useState("");
  const [energyLevel, setEnergyLevel] = useState<number | null>(null);
  const checkIns = memories.filter((m) => m.entry_type === "checkin");
  const [justCheckedIn, setJustCheckedIn] = useState(false);
  const [checkInError, setCheckInError] = useState<string | null>(null);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [journalText, setJournalText] = useState("");
  const [journalSaving, setJournalSaving] = useState(false);
  const [journalError, setJournalError] = useState<string | null>(null);
  const [editingJournalId, setEditingJournalId] = useState<string | null>(null);
  
  const [errorReflection, setErrorReflection] = useState<string | null>(null);
 
  const [weeklyReflection, setWeeklyReflection] = useState<WeeklyReflection | null>(null);
  const [loadingReflection, setLoadingReflection] = useState(false);
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [authReady, setAuthReady] = useState(false);

  const [authTick, setAuthTick] = useState(0);
  const [hasEntered, setHasEntered] = useState(false);

  const [stateCheckInComplete, setStateCheckInComplete] = useState(() => {
  const today = new Date().toISOString().slice(0, 10);
  return localStorage.getItem(LAST_CHECKIN_DATE_KEY) === today;
});

  const markStateCheckInComplete = (value: boolean) => {
    setStateCheckInComplete(value);

    if (value) {
      const today = new Date().toISOString().slice(0, 10);
      localStorage.setItem(LAST_CHECKIN_DATE_KEY, today);
    }
  };
  const [currentMood, setCurrentMood] = useState<number | null>(null);
  const [currentEnergy, setCurrentEnergy] = useState<number | null>(null);

  const lastHandoff = loadHandoffChoice();

  const loadWeeklyReflection = useCallback(async () => {
  try {
    setLoadingReflection(true);
    setErrorReflection(null);

    const data = await getWeeklyReflection();
    setWeeklyReflection(data);
  } catch (err) {
    console.error(err);
    setErrorReflection("Could not load weekly reflection.");
    setWeeklyReflection(null);
  } finally {
    setLoadingReflection(false);
  }
}, []);

  const inputStyles: React.CSSProperties = {
  width: "100%",
  padding: 12,
  borderRadius: 8,
  border: "1px solid rgba(255,255,255,0.2)",
  background: "rgba(0,0,0,0.2)",
  color: "inherit",
  fontSize: "1.1rem",
  lineHeight: 1.6,
  fontFamily: "inherit",
  fontWeight: 400,
};

const writingColumn: React.CSSProperties = {
  width: "100%",
  maxWidth: 1100,
  margin: "0 auto",
};

  useEffect(() => {
  if (!token || !authReady) return;
  if (view === "admin" || view === "teacher") return;

  async function loadInitial() {
    try {
      setLoading(true);
      setCheckInError(null);

      const [p, m, h, j] = await Promise.all([
      getProfile(),
      getRecentMemories(100),
      getHomeSummary(),
      getJournalEntries(),
    ]);

      setProfile(p);
      setMemories(m);
      setHomeSummary(h);
      setJournalEntries(j);
    } catch (err: any) {
      console.error(err);
      setError("Could not load your home data.");
    } finally {
      setLoading(false);
    }
  }

  loadInitial();
}, [token, authReady, authTick, view]);

useEffect(() => {
  let alive = true;

  async function boot() {
    if (!token) {
      if (alive) setAuthReady(true);
      return;
    }

    try {
      const user = await validateToken();
      if (!alive) return;

      if (!user) {
        logout();
        setToken(null);
        return;
      }

      if (user.role === "admin") {
        setView("admin");
      } else if (user.role === "teacher") {
        setView("teacher");
      } else {
        setView("home");
      }
    } finally {
      if (alive) setAuthReady(true);
    }
  }

  setAuthReady(false);
  boot();

  return () => {
    alive = false;
  };
}, [token]);
// ...your hooks above...

useEffect(() => {
  if (!token || !authReady) return;
  if (view !== "reflections") return;
  if (weeklyReflection) return;
  if (loadingReflection) return;
  if (errorReflection) return;

  void loadWeeklyReflection();
}, [
  token,
  authReady,
  view,
  weeklyReflection,
  loadingReflection,
  errorReflection,
  loadWeeklyReflection,
]);

// ✅ Render gates AFTER hooks
if (!authReady) {
  return <div>Loading…</div>;
}

if (!token) {
  if (!hasEntered) {
    return (
      <SanctuaryEntryScreen onEnter={() => setHasEntered(true)} />
    );
  }

  return (
    <Login
      onSuccess={(accessToken) => {
        localStorage.setItem("token", accessToken);
        setToken(accessToken);
        setAuthTick((x) => x + 1);
      }}
    />
  );
}
 
if (view === "admin") {
  return (
    <div style={{ padding: 20 }}>
      <h2>Admin Dashboard</h2>

      <button
        onClick={handleLogout}
        style={{
          marginTop: 20,
          padding: "0.6rem 1.2rem",
          borderRadius: 999,
          border: "1px solid #9ca3af",
          background: "transparent",
          cursor: "pointer",
        }}
      >
        Log out
      </button>
    </div>
  );
}

if (view === "teacher") {
  return <TeacherDashboard onLogout={handleLogout} />;
}

   async function handleCreateMemory() {
    if (!checkInText.trim()) return;
    try {
      setLoading(true);
      setError(null);
      const created = await createMemory(checkInText.trim(), "checkin", energyLevel);

setMemories((prev) => [created, ...prev]);

setHomeSummary((prev: any) =>
  prev
    ? {
        ...prev,
        recent_checkin: {
          id: created.id,
          raw_text: created.raw_text,
          energy_level: created.energy_level,
          created_at: created.created_at,
        },
      }
    : prev
);

setCheckInText("");
setEnergyLevel(null);

const today = new Date().toISOString().slice(0, 10);
localStorage.setItem(LAST_CHECKIN_DATE_KEY, today);
setStateCheckInComplete(true);

setJustCheckedIn(true);
setViewPersist("home");

    } catch (err: any) {
      console.error(err);
      setCheckInError("Could not save your check-in.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteMemory(id: number) {
  const ok = window.confirm("Delete this entry?");
  if (!ok) return;

  try {
    setLoading(true);
    setError(null);
    await deleteMemory(id);
    setMemories((prev) => prev.filter((m) => m.id !== id));
  } catch (err) {
    console.error(err);
    setError("Could not delete that entry.");
  } finally {
    setLoading(false);
  }
}

  async function handleCreateJournal() {
  if (!journalText.trim()) return;

  try {
    setJournalSaving(true);
    setJournalError(null);

    const created = await createJournalEntry(journalText.trim());
    setJournalEntries((prev) => [created, ...prev]);
    setJournalText("");
    setEditingJournalId(null);
  } catch (err: any) {
    console.error(err);
    setJournalError("Could not save your journal entry.");
  } finally {
    setJournalSaving(false);
  }
}

async function handleUpdateJournal() {
  if (!editingJournalId || !journalText.trim()) return;

  try {
    setJournalSaving(true);
    setJournalError(null);

    const updated = await updateJournalEntry(editingJournalId, journalText.trim());

    setJournalEntries((prev) =>
      prev.map((entry) => (entry.id === updated.id ? updated : entry))
    );

    setEditingJournalId(null);
    setJournalText("");
  } catch (err) {
    console.error(err);
    setJournalError("Could not update your journal entry.");
  } finally {
    setJournalSaving(false);
  }
}

async function handleCaptureSessionNote(note: string) {
  const trimmed = note.trim();
  if (!trimmed) return;

  try {
    setJournalSaving(true);
    setJournalError(null);

    const created = await createJournalEntry(trimmed);
    setJournalEntries((prev) => [created, ...prev]);
  } catch (err) {
    console.error(err);
    setJournalError("Could not save your session note.");
  } finally {
    setJournalSaving(false);
  }
}
async function handleDeleteJournal(id: string) {
  const ok = window.confirm("Delete this journal entry?");
  if (!ok) return;

  try {
    setJournalSaving(true);
    setJournalError(null);
    await deleteJournalEntry(id);
    setJournalEntries((prev) => prev.filter((entry) => entry.id !== id));

    if (editingJournalId === id) {
      setEditingJournalId(null);
      setJournalText("");
    }
  } catch (err) {
    console.error(err);
    setJournalError("Could not delete that journal entry.");
  } finally {
    setJournalSaving(false);
  }
}

// 3) Error (full-screen, but doesn’t pretend it’s onboarding)
if (error) {
  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ marginTop: 0 }}>Could not load</h2>
      <p style={{ opacity: 0.8 }}>{error}</p>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: "10px 14px",
            borderRadius: 12,
            border: "1px solid #ccc",
            background: "white",
            cursor: "pointer",
          }}
        >
          Retry
        </button>

        <button
          onClick={() => setViewPersist("entrance")}
          style={{
            padding: "10px 14px",
            borderRadius: 12,
            border: "1px solid #ccc",
            background: "white",
            cursor: "pointer",
            opacity: 0.9,
          }}
        >
          Open “First 10 minutes”
        </button>
      </div>
    </div>
  );
}

// 4) Safe memories (prevents crashes)

const latestJournal = journalEntries[0];

const reflectionSuggestions = weeklyReflection?.suggestions ?? [];

const activeThreads = homeSummary?.active_threads ?? [];
const hasActiveThreads = activeThreads.length > 0;
const threadWithNextStep = activeThreads.find((thread: any) => thread.next_step?.title);
const hasNextStep = Boolean(threadWithNextStep);

const homeRecommendation = getHomeRecommendation({
  hasCheckInToday: stateCheckInComplete,
  mood: currentMood,
  energy: currentEnergy,
  hasActiveThread: hasActiveThreads,
  hasNextStep: hasNextStep,
  hasJournalEntries: journalEntries.length > 0,
});

let homeMessage = homeRecommendation.reason;

  return (

  <div
    style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      background: "#050608",
      color: "#e5e5e5",
    }}
  >
    {view !== "entrance" && (
    <header
      style={{
        padding: "1rem 1.5rem",
        borderBottom: "1px solid #e5e7eb",
        background: "#ffffff",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
  <img
    src="/logo.png"
    alt="Calm But Capable"
    style={{ height: "60px", marginBottom: "2px", width: "fit-content", opacity: 0.85 }}
  />

  <div style={{ fontSize: "1.1rem", fontWeight: 600, color: "#111827" }}>
    {profile ? `Welcome, ${profile.display_name}` : "Welcome"}
  </div>

  <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>
    Supported by Calm But Capable
  </div>
</div>

      <nav style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
  <NavButton label="Home" active={view === "home"} onClick={() => setViewPersist("home")} />
  <NavButton label="Check-In" active={view === "checkin"} onClick={() => setViewPersist("checkin")} />
  <NavButton label="Journal" active={view === "journals"} onClick={() => setViewPersist("journals")} />
  <NavButton label="Reflections" active={view === "reflections"} onClick={() => setViewPersist("reflections")} />
   <NavButton label="Workspace" active={view === "workspace"} onClick={openWorkspace}
  />
  <button
  type="button"
  onClick={handleLogout}
  style={{
    padding: "0.45rem 0.8rem",
    borderRadius: 999,
    border: "1px solid #9ca3af",
    color: "#374151",
    background: "transparent",
    cursor: "pointer",
  }}
>
  Log out
</button>
</nav>
    </header>
)}

    <main
      style={{
        flex: 1,
        padding: "1.5rem",
        maxWidth: 1100,
        width: "100%",
        margin: "0 auto",
      }}
    >

    {loading && (
  <p style={{ opacity: 0.8, fontSize: "1.1rem" }}>
    Loading…
  </p>
)}
        {view === "entrance" && (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      width: "100%",
    }}
  >
    <div style={{ width: "100%", maxWidth: 720 }}>
      <SanctuaryEntranceFlow
        onFinish={() => {
  try {
    localStorage.setItem(ONBOARDING_KEY, "1");
  } catch {}
  setViewPersist("handoff");
}}
      />
    </div>
  </div>
)}


   {view === "handoff" && (
  <GentleHandoff
    onChoose={(choice) => {
      saveHandoffChoice(choice);

      if (choice === "one_small_step") return setViewPersist("checkin");
      if (choice === "clarity_check") return setViewPersist("reflections");
      return setViewPersist("home"); // coffee_time OR done_for_now
    }}
  />
)}


        {view === "home" && (
  <>
    <SessionCheckInPrompt
      stateCheckInComplete={stateCheckInComplete}
      setCurrentMood={setCurrentMood}
      setCurrentEnergy={setCurrentEnergy}
      setStateCheckInComplete={markStateCheckInComplete}
    />

   <HomeView
  stateCheckInComplete={stateCheckInComplete}
  setCurrentMood={setCurrentMood}
  setCurrentEnergy={setCurrentEnergy}
  setStateCheckInComplete={markStateCheckInComplete}

  justCheckedIn={justCheckedIn}
  clearJustCheckedIn={() => setJustCheckedIn(false)}

  homeMessage={homeMessage}
  lastHandoff={lastHandoff}
  prettyChoice={prettyChoice}
  homeSummary={homeSummary}
  setWorkspaceThreadId={setWorkspaceThreadId}
  setViewPersist={setViewPersist}
  latestJournal={latestJournal}
  checkIns={checkIns}
  handleDeleteMemory={handleDeleteMemory}
  homeRecommendation={homeRecommendation}
  openWorkspace={openWorkspace}
/>
  </>
)}

{view === "checkin" && (
  <section>
    <h2 style={{ marginTop: 0 }}>Today’s Check-In</h2>
    <p style={{ opacity: 0.8, fontSize: "1.1rem" }}>
      Take a moment to note your energy levels. It helps you set a realistic pace for your work.
    </p>

   <div style={writingColumn}>
  <div style={{ marginTop: "1rem", marginBottom: "0.75rem" }}>
    <div style={{ opacity: 0.85, fontSize: "0.95rem", marginBottom: "0.5rem" }}>
      Energy today
    </div>

    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
      {[1, 2, 3, 4, 5].map((level) => (
        <button
          key={level}
          type="button"
          onClick={() => setEnergyLevel(level)}
          style={{
            padding: "0.5rem 0.9rem",
            borderRadius: 999,
            border: energyLevel === level ? "1px solid #63b3ed" : "1px solid #444",
            background: energyLevel === level ? "rgba(43, 108, 176, 0.25)" : "transparent",
            color: energyLevel === level ? "#fff" : "#ccc",
            cursor: "pointer",
            fontSize: "0.95rem",
          }}
        >
          {level}
        </button>
      ))}

      <button
        type="button"
        onClick={() => setEnergyLevel(null)}
        style={{
          padding: "0.5rem 0.9rem",
          borderRadius: 999,
          border: energyLevel === null ? "1px solid #63b3ed" : "1px solid #444",
          background: energyLevel === null ? "rgba(43, 108, 176, 0.25)" : "transparent",
          color: energyLevel === null ? "#fff" : "#ccc",
          cursor: "pointer",
          fontSize: "0.95rem",
        }}
      >
        Skip
      </button>
    </div>

    <div style={{ marginTop: "0.4rem", fontSize: "0.85rem", opacity: 0.65 }}>
      Optional. 1 = very low, 5 = very high.
    </div>
  </div>
  {checkInError && (
  <div
    style={{
      marginTop: "1rem",
      marginBottom: "0.75rem",
      padding: "0.75rem 1rem",
      borderRadius: 8,
      background: "#401919",
      border: "1px solid #a33",
      fontSize: "0.95rem",
    }}
  >
    {checkInError}
  </div>
)}
  <textarea
    className="sanctuary-textarea"
        value={checkInText}
        onChange={(e) => setCheckInText(e.target.value)}
        placeholder="Anything you want to note before you begin? This could be how you're feeling or what you want to work on."
        rows={6}
        style={{ ...inputStyles, resize: "vertical" }}
      />

      <div style={{ marginTop: "0.75rem", display: "flex", gap: "0.5rem" }}>
        <button
          onClick={handleCreateMemory}
          style={{
            padding: "0.6rem 1.2rem",
            borderRadius: 999,
            border: "none",
            background: "#0991ED",
            color: "white",
            fontSize: "1.1rem",
            cursor: "pointer",
          }}
        >
          Save Check-In
        </button>

       <button
          onClick={() => setViewPersist("home")}
          style={{
            padding: "0.6rem 1.2rem",
            borderRadius: 999,
            border: "1px solid #374151",
            background: "transparent",
            color: "#9ca3af",
            fontSize: "1.1rem",
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  </section>
)}

       {view === "journals" && (
  <>
    <SessionCheckInPrompt
      stateCheckInComplete={stateCheckInComplete}
      setCurrentMood={setCurrentMood}
      setCurrentEnergy={setCurrentEnergy}
      setStateCheckInComplete={setStateCheckInComplete}
    />

    <JournalsView
      journalText={journalText}
      setJournalText={setJournalText}
      handleCreateJournal={handleCreateJournal}
      handleUpdateJournal={handleUpdateJournal}
      journalSaving={journalSaving}
      journalError={journalError}
      journalEntries={journalEntries}
      handleDeleteJournal={handleDeleteJournal}
      handleStartEditJournal={handleStartEditJournal}
      handleCancelEditJournal={handleCancelEditJournal}
      editingJournalId={editingJournalId}
      writingColumn={writingColumn}
      inputStyles={inputStyles}
    />
  </>
)}

       {view === "reflections" && (
  <>
    <SessionCheckInPrompt
      stateCheckInComplete={stateCheckInComplete}
      setCurrentMood={setCurrentMood}
      setCurrentEnergy={setCurrentEnergy}
      setStateCheckInComplete={setStateCheckInComplete}
    />

    <ReflectionsView
      loadingReflection={loadingReflection}
      weeklyReflection={weeklyReflection}
      reflectionSuggestions={reflectionSuggestions}
    />
  </>
)}

{view === "firstSteps" && (
  <section style={{ maxWidth: 720, margin: "0 auto" }}>
    <h2>Welcome</h2>

    <p style={{ opacity: 0.8, fontSize: "1.1rem" }}>
      This is your space to think, plan, and move things forward at your own pace.
    </p>

    <div style={{ marginTop: "1.5rem", lineHeight: 1.6 }}>
      <p><strong>Check-in</strong> — helps tailor things to how you're feeling today.</p>
      <p><strong>Journal</strong> — a space to think or write freely.</p>
      <p><strong>Workspace</strong> — break things into steps and move forward.</p>
      <p><strong>Reflections</strong> — look back and spot patterns.</p>
    </div>

    <p style={{ marginTop: "1.5rem", opacity: 0.8 }}>
      If you're not sure where to begin, a quick check-in is a good place to start.
    </p>

    <button
      onClick={() => {
        localStorage.setItem(ONBOARDING_KEY, "1");
        setViewPersist("home");
      }}
      style={{
        marginTop: "1.5rem",
        padding: "0.6rem 1.2rem",
        borderRadius: 999,
        border: "none",
        background: "#0991ED",
        color: "white",
        fontSize: "1.1rem",
        cursor: "pointer",
      }}
    >
      Start
    </button>
  </section>
)}

 {view === "workspace" && (
  <section>
    <SessionCheckInPrompt
      stateCheckInComplete={stateCheckInComplete}
      setCurrentMood={setCurrentMood}
      setCurrentEnergy={setCurrentEnergy}
      setStateCheckInComplete={setStateCheckInComplete}
    />

    <h2 style={{ marginTop: 0 }}>Thread Workspace</h2>
    <p style={{ opacity: 0.8, fontSize: "1.1rem" }}>
      Turn a plan into clear, actionable steps and focus on the next open step.
    </p>
{workspaceThreadId !== null ? (
  <>
    
    <ThreadWorkspace
      threadId={workspaceThreadId}
      onOpenProject={(plan) => {
        setActiveProject(plan);
        setViewPersist("projectWorkspace");
      }}
    />
  </>
) : (
  <div
    style={{
      marginTop: "1.5rem",
      padding: "1rem",
      borderRadius: 10,
      border: "1px solid #222",
      background: "#111",
      boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
    }}
  >
    <p style={{ marginTop: 0 }}>
      You don’t have a workspace thread yet.
    </p>
    <button
  type="button"
  onClick={openWorkspace}
>
  Start a workspace
</button>
  </div>
)}

  </section>
)}

  {view === "projectWorkspace" && activeProject && (
  <ProjectWorkspace
    planId={activeProject.id}
    planTitle={activeProject.title}
    planDescription={activeProject.description}
    onBack={() => setViewPersist("workspace")}
    onCaptureSessionNote={handleCaptureSessionNote}
  />
)}

{view === "projectWorkspace" && !activeProject && (
  <section>
    <h2 style={{ marginTop: 0 }}>Workspace</h2>
    <p style={{ opacity: 0.8 }}>
      Choose a project to continue.
    </p>

    {workspaceThreadId !== null ? (
      <ThreadWorkspace
        threadId={workspaceThreadId}
        onOpenProject={(plan) => {
          setActiveProject(plan);
          setViewPersist("projectWorkspace");
        }}
      />
    ) : (
      <button
  type="button"
  onClick={openWorkspace}
  style={{
    padding: "0.6rem 1.2rem",
    borderRadius: 999,
    border: "none",
    background: "#0991ED",
    color: "#ffffff",
    fontSize: "1rem",
    cursor: "pointer",
  }}
>
  Start a workspace
</button>
    )}
  </section>
)}
      </main>
    </div>
  );
}

type NavButtonProps = {
  label: string;
  active: boolean;
  onClick: () => void;
};

function NavButton({ label, active, onClick }: NavButtonProps) {
  return (
    <button
      onClick={onClick}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.background = "#e6f2fb";
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.background = "transparent";
      }}
      onMouseDown={(e) => {
        e.currentTarget.style.transform = "scale(0.97)";
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform = "scale(1)";
      }}
      style={{
        padding: "0.45rem 0.9rem",
        borderRadius: 999,
        border: active ? "none" : "1px solid transparent",
        background: active ? "#0991ED" : "transparent",
        color: active ? "#ffffff" : "#374151",
        fontWeight: 500,
        cursor: "pointer",
        transition: "all 0.15s ease",
      }}
    >
      {label}
    </button>
  );
}

export default App;

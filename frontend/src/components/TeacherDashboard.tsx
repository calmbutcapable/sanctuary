import React, { useEffect, useState } from "react";
import { authHeaders } from "../api/auth";

type Student = {
  id: string;
  email: string;
  display_name?: string | null;
  role: string;
  is_active: boolean;
  teacher_id?: string | null;
  student_limit?: number | null;
  last_activity?: string | null;
  project_count?: number;
  progress_percent?: number;
  energy_trend?: string | null;
};

export default function TeacherDashboard({ onLogout }: { onLogout: () => void }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("Student123!");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadStudents() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/users/students", {
        headers: authHeaders(),
      });

      if (!res.ok) throw new Error("Could not load students");

      const data = await res.json();
      setStudents(data);
    } catch (err) {
      console.error(err);
      setError("Could not load students.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadStudents();
  }, []);

  async function createStudent(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      const res = await fetch("/users/students", {
        method: "POST",
        headers: {
          ...authHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          display_name: displayName,
          email,
          password,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.detail || "Could not create student");
      }

      setDisplayName("");
      setEmail("");
      setPassword("Student123!");
      await loadStudents();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Could not create student.");
    }
  }

  async function deactivateStudent(studentId: string) {
    setError(null);

    try {
      const res = await fetch(`/users/students/${studentId}/deactivate`, {
        method: "PATCH",
        headers: authHeaders(),
      });

      if (!res.ok) throw new Error("Could not deactivate student");

      await loadStudents();
    } catch (err) {
      console.error(err);
      setError("Could not deactivate student.");
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#050608", color: "#e5e5e5" }}>
      <header
        style={{
          padding: "1rem 1.5rem",
          borderBottom: "1px solid #e5e7eb",
          background: "#ffffff",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color: "#111827",
        }}
      >
        <div>
          <div style={{ fontSize: "1.2rem", fontWeight: 700 }}>Teacher Dashboard</div>
          <div style={{ fontSize: "0.85rem", color: "#6b7280" }}>
            Manage student accounts
          </div>
        </div>

        <button
          type="button"
          onClick={onLogout}
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
      </header>

      <main style={{ padding: "1.5rem", maxWidth: 900, margin: "0 auto" }}>
        <section
          style={{
            padding: "1rem",
            borderRadius: 12,
            border: "1px solid #222",
            background: "#111",
            marginBottom: "1.5rem",
          }}
        >
          <h2 style={{ marginTop: 0 }}>Create student</h2>

          <form onSubmit={createStudent} style={{ display: "grid", gap: "0.75rem" }}>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Student name"
              required
              style={inputStyle}
            />

            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Student email"
              type="email"
              required
              style={inputStyle}
            />

            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Temporary password"
              type="text"
              required
              style={inputStyle}
            />

            <button type="submit" style={primaryButtonStyle}>
              Create student
            </button>
          </form>
        </section>

        <section
          style={{
            padding: "1rem",
            borderRadius: 12,
            border: "1px solid #222",
            background: "#111",
          }}
        >
          <h2 style={{ marginTop: 0 }}>Students</h2>

          {loading && <p>Loading students…</p>}
          {error && <p style={{ color: "#fca5a5" }}>{error}</p>}

          {!loading && students.length === 0 && (
            <p style={{ opacity: 0.8 }}>No students created yet.</p>
          )}

          <div style={{ display: "grid", gap: "0.75rem" }}>
            {students.map((student) => (
              <div
                key={student.id}
                style={{
                  padding: "0.9rem",
                  borderRadius: 10,
                  border: "1px solid #333",
                  background: "#181818",
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "1rem",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontWeight: 700 }}>
                    {student.display_name || student.email.split("@")[0]}
                    </div>
                  <div style={{ fontSize: "0.85rem", opacity: 0.75 }}>
                    {student.email}
                    </div>
                  <div style={{ fontSize: "0.8rem", opacity: 0.65 }}>
                    {student.is_active ? "Active" : "Inactive"}
                    </div>
                  <div style={{ fontSize: "0.8rem", opacity: 0.65 }}>
                    Last activity: {student.last_activity ? new Date(student.last_activity).toLocaleString() : "No activity yet"}
                    </div>
                  <div style={{ fontSize: "0.8rem", opacity: 0.65 }}>
                    Projects: {student.project_count ?? 0}
                    </div>
                  <div style={{ fontSize: "0.8rem", opacity: 0.65 }}>
                    Progress: {student.progress_percent ?? 0}%
                    </div>
                  <div
                        style={{
                            fontSize: "0.8rem",
                            opacity: 0.9,
                            color:
                        student.energy_trend === "improving"
                            ? "#22c55e"
                            : student.energy_trend === "low"
                            ? "#ef4444"
                            : student.energy_trend === "steady"
                            ? "#eab308"
                            : "#9ca3af", // grey for no data
                        }}
                        >
                        Energy: {student.energy_trend ?? "No data"}
                        </div>

                </div>

                {student.is_active && (
                  <button
                    type="button"
                    onClick={() => deactivateStudent(student.id)}
                    style={dangerButtonStyle}
                  >
                    Deactivate
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "0.65rem 0.8rem",
  borderRadius: 8,
  border: "1px solid #374151",
  background: "#050608",
  color: "#e5e5e5",
  fontSize: "1rem",
};

const primaryButtonStyle: React.CSSProperties = {
  padding: "0.7rem 1rem",
  borderRadius: 999,
  border: "none",
  background: "#0991ED",
  color: "white",
  cursor: "pointer",
  fontSize: "1rem",
};

const dangerButtonStyle: React.CSSProperties = {
  padding: "0.5rem 0.8rem",
  borderRadius: 999,
  border: "1px solid #ef4444",
  background: "transparent",
  color: "#fca5a5",
  cursor: "pointer",
};
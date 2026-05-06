import React, { useState } from "react";
import { login } from "../api/auth";

type Props = {
  onSuccess: (accessToken: string) => void;
};

export default function Login({ onSuccess }: Props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

   try {
  const res = await login(username, password);
  onSuccess(res.access_token);
}
    catch (err: any) {
      setError(err?.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
      <form
        onSubmit={handleSubmit}
        style={{
          width: "100%",
          maxWidth: 420,
          padding: 20,
          borderRadius: 12,
          border: "1px solid #222",
          background: "#111",
          color: "#e5e5e5",
        }}
      >
        <h2 style={{ marginTop: 0 }}>Sign in</h2>

        <label style={{ display: "block", marginTop: 12, fontSize: 14, opacity: 0.9 }}>
          Username
        </label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          style={{
            width: "100%",
            padding: 10,
            marginTop: 6,
            borderRadius: 8,
            border: "1px solid #333",
            background: "#000",
            color: "inherit",
          }}
        />

        <label style={{ display: "block", marginTop: 12, fontSize: 14, opacity: 0.9 }}>
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          style={{
            width: "100%",
            padding: 10,
            marginTop: 6,
            borderRadius: 8,
            border: "1px solid #333",
            background: "#000",
            color: "inherit",
          }}
        />

        {error && (
          <div style={{ marginTop: 12, color: "#ffb4b4", fontSize: 14 }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !username || !password}
          style={{
            marginTop: 16,
            width: "100%",
            padding: "10px 14px",
            borderRadius: 10,
            border: "none",
            cursor: "pointer",
            background: "#2b6cb0",
            color: "white",
            opacity: loading ? 0.8 : 1,
          }}
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
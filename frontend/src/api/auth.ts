// src/api/auth.ts
const API_BASE = "";

export type TokenResponse = {
  access_token: string;
  token_type: string;
};

// Keep this self-contained to avoid circular imports.
async function throwIfNotOk(res: Response, message: string) {
  if (res.ok) return;

  let detail = "";
  try {
    const data = await res.json();
    detail = data?.detail ? `: ${data.detail}` : "";
  } catch {
    // ignore json parse errors
  }

  const err: any = new Error(`${message} (${res.status})${detail}`);
  err.status = res.status;
  throw err;
}

export function authHeaders(): Record<string, string> {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function login(username: string, password: string): Promise<TokenResponse> {
  const body = new URLSearchParams();
  body.set("username", username);
  body.set("password", password);

  const res = await fetch(`${API_BASE}/auth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  await throwIfNotOk(res, "Login failed");
  const data = (await res.json()) as TokenResponse;

  // Store token for future requests
  localStorage.setItem("token", data.access_token);
  return data;
}

export function logout() {
  localStorage.removeItem("token");
}

// Cheap “is my token still valid?” call.
export async function authMe(): Promise<any> {
  const res = await fetch(`${API_BASE}/auth/`, {
    headers: { ...authHeaders() },
  });

  await throwIfNotOk(res, "Token validation failed");
  return res.json();
}

// Returns false for expired/invalid token WITHOUT making a mess.
export async function validateToken(): Promise<any | false> {
  try {
    return await authMe();
  } catch (err: any) {
    const status = err?.status ?? err?.response?.status;
    if (status === 401) return false;
    throw err; // real error (network/server) should still surface
  }
}
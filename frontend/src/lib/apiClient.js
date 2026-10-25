"use client";

// Browser-side calls to the Go API (admin panel, account, checkout, support forms).
// Sessions are HttpOnly cookies set by the API, so every call sends credentials.
export const PUBLIC_API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8090";

export async function api(method, path, body) {
  let res;
  try {
    res = await fetch(`${PUBLIC_API}${path}`, {
      method,
      credentials: "include",
      headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    return { ok: false, status: 0, message: "Can't reach the server. Check that the backend is running." };
  }
  let data = {};
  try { data = await res.json(); } catch {}
  return { ok: res.ok && data.success !== false, status: res.status, message: data.message, ...data };
}

export async function upload(file) {
  const fd = new FormData();
  fd.append("file", file);
  try {
    const res = await fetch(`${PUBLIC_API}/api/admin/upload`, { method: "POST", credentials: "include", body: fd });
    const data = await res.json();
    return { ok: res.ok && data.success, ...data };
  } catch {
    return { ok: false, message: "Upload failed" };
  }
}

// uploaded media is stored as "/uploads/..." on the API; full URLs are used as they are
export const mediaUrl = (u) => (!u ? "" : /^https?:\/\//.test(u) || u.startsWith("/media/") || u.startsWith("/brand/") ? u : `${PUBLIC_API}${u}`);

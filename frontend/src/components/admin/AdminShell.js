"use client";

import { createContext, useContext, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { api } from "@/lib/apiClient";
import { sections } from "@/lib/adminSchema";

const AdminCtx = createContext(null);
export const useAdmin = () => useContext(AdminCtx);

function Login({ onDone }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    const r = await api("POST", "/api/admin/login", { email, password });
    setBusy(false);
    if (r.ok) onDone();
    else setErr(r.message || "Sign in failed");
  }

  return (
    <div className="adm-login">
      <form className="adm-card adm-login-box" onSubmit={submit}>
        <img src="/brand/newcom-logo.png" alt="Newcom" className="adm-login-logo logo-l" />
        <img src="/brand/newcom-logo-dark.png" alt="" aria-hidden="true" className="adm-login-logo logo-d" />
        <h1>Website admin</h1>
        <p className="adm-mute">Sign in to manage banners, promotions, pre-built PCs and orders.</p>
        <label className="adm-f">Email<input className="adm-in" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
        <label className="adm-f">Password<input className="adm-in" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
        {err && <div className="adm-err" role="alert">{err}</div>}
        <button className="adm-btn adm-btn-primary" disabled={busy} style={{ width: "100%", marginTop: 8 }}>{busy ? "Signing in…" : "Sign in"}</button>
        <Link href="/" className="adm-back">← Back to the website</Link>
      </form>
    </div>
  );
}

export default function AdminShell({ children }) {
  const path = usePathname();
  const [me, setMe] = useState(undefined); // undefined = loading, null = signed out
  const [down, setDown] = useState("");
  const [open, setOpen] = useState(false);

  async function load() {
    const r = await api("GET", "/api/admin/me");
    if (r.ok) { setMe(r.payload); setDown(""); }
    else { setMe(null); setDown(r.status === 0 || r.status === 503 ? r.message : ""); }
  }
  useEffect(() => { load(); }, []);
  useEffect(() => { setOpen(false); }, [path]);

  if (me === undefined) return <div className="adm-load">Loading…</div>;
  if (me === null) return (
    <>
      {down && <div className="adm-banner-warn">{down}</div>}
      <Login onDone={load} />
    </>
  );

  async function logout() {
    await api("POST", "/api/admin/logout", {});
    setMe(null);
  }

  const nav = (href, label) => (
    <Link key={href} href={href} className={`adm-nav-a${path === href ? " on" : ""}`}>{label}</Link>
  );

  return (
    <AdminCtx.Provider value={{ me, reload: load }}>
      <div className="adm">
        <aside className={`adm-side${open ? " open" : ""}`}>
          <div className="adm-brand">
            <Link href="/admin">Newcom <span>admin</span></Link>
            <button className="adm-burger" aria-label="Menu" aria-expanded={open} onClick={() => setOpen(!open)}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d={open ? "M6 6l12 12M18 6 6 18" : "M4 7h16M4 12h16M4 17h16"} /></svg>
            </button>
          </div>
          <nav className="adm-nav">
            {nav("/admin", "Dashboard")}
            {sections.map((s) => (
              <div key={s.group} className="adm-nav-g">
                <div className="adm-nav-h">{s.group}</div>
                {s.items.map((i) => nav(`/admin/r/${i.res}`, i.label))}
                {s.group === "System" && nav("/admin/account", me.Role === "admin" ? "Admin users and password" : "My password")}
              </div>
            ))}
          </nav>
          <div className="adm-me">
            <div><strong>{me.Name}</strong><span>{me.Email} · {me.Role}</span></div>
            <div className="adm-me-a">
              <Link href="/" target="_blank">View site</Link>
              <button onClick={logout}>Sign out</button>
            </div>
          </div>
        </aside>
        <section className="adm-main">{children}</section>
      </div>
    </AdminCtx.Provider>
  );
}

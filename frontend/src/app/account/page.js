"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/apiClient";
import { lkr } from "@/lib/site";

const provinces = ["Western", "Central", "Southern", "Northern", "Eastern", "North Western", "North Central", "Uva", "Sabaragamuwa"];
const STATUS = { new: "Received", confirmed: "Confirmed", paid: "Paid", shipped: "On the way", completed: "Completed", cancelled: "Cancelled" };

function SignIn({ onDone }) {
  const [mode, setMode] = useState("login");
  const [f, setF] = useState({ name: "", email: "", mobile: "", password: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => { setF({ ...f, [k]: e.target.value }); setErr(""); };

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    const r = mode === "login"
      ? await api("POST", "/api/web/account/login", { email: f.email, password: f.password })
      : await api("POST", "/api/web/account/register", { name: f.name, email: f.email, mobile: f.mobile.replace(/[\s-]/g, ""), password: f.password });
    setBusy(false);
    if (r.ok) onDone();
    else setErr(r.message || "Something went wrong. Please try again.");
  }

  return (
    <div className="acc-auth card">
      <div className="seg" role="tablist">
        <button type="button" role="tab" aria-selected={mode === "login"} className={mode === "login" ? "on" : ""} onClick={() => setMode("login")}>Sign in</button>
        <button type="button" role="tab" aria-selected={mode === "register"} className={mode === "register" ? "on" : ""} onClick={() => setMode("register")}>Create account</button>
      </div>
      <form onSubmit={submit} className="acc-form">
        {mode === "register" && (
          <>
            <label className="fl">Full name<input className="in" value={f.name} onChange={set("name")} autoComplete="name" required /></label>
            <label className="fl">Mobile number<input className="in" value={f.mobile} onChange={set("mobile")} inputMode="tel" autoComplete="tel" required /></label>
          </>
        )}
        <label className="fl">Email<input className="in" type="email" value={f.email} onChange={set("email")} autoComplete="email" required /></label>
        <label className="fl">Password{mode === "register" && " (8+ characters)"}<input className="in" type="password" value={f.password} onChange={set("password")} autoComplete={mode === "login" ? "current-password" : "new-password"} required minLength={mode === "register" ? 8 : undefined} /></label>
        {err && <div className="err" role="alert">{err}</div>}
        <button className="btn btn-primary" disabled={busy} style={{ width: "100%" }}>{busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}</button>
        {mode === "register" && <p className="sub" style={{ fontSize: 13, margin: 0 }}>Ordered before as a guest? Use the same email and your earlier orders appear here.</p>}
      </form>
    </div>
  );
}

function Profile({ me, onSaved }) {
  const [f, setF] = useState(me);
  const [msg, setMsg] = useState(null);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });
  async function save(e) {
    e.preventDefault();
    const r = await api("PUT", "/api/web/account/me", { ...f, mobile: (f.mobile || "").replace(/[\s-]/g, "") });
    setMsg(r.ok ? { t: "Saved." } : { bad: true, t: r.message || "Couldn't save" });
    if (r.ok) onSaved();
  }
  const inp = (k, label, ac) => <label className="fl">{label}<input className="in" value={f[k] || ""} onChange={set(k)} autoComplete={ac} /></label>;
  return (
    <form className="card acc-card" onSubmit={save}>
      <h2>My details</h2>
      <p className="sub" style={{ fontSize: 14 }}>{me.email}</p>
      <div className="cform">
        {inp("name", "Full name", "name")}
        {inp("mobile", "Mobile number", "tel")}
        <label className="fl" style={{ gridColumn: "1 / -1" }}>Street address<input className="in" value={f.address || ""} onChange={set("address")} autoComplete="street-address" /></label>
        {inp("city", "Town or city", "address-level2")}
        {inp("district", "District", "off")}
        <label className="fl">Province
          <select className="in" value={f.province || ""} onChange={set("province")}><option value="">Select…</option>{provinces.map((p) => <option key={p}>{p}</option>)}</select>
        </label>
        <label className="fl acc-check"><span><input type="checkbox" checked={!!f.newsletter} onChange={set("newsletter")} /> Email me offers and new arrivals</span></label>
      </div>
      {msg && <div className={msg.bad ? "err" : "notice"} role="status" style={{ marginTop: 8 }}>{msg.t}</div>}
      <button className="btn btn-primary" style={{ marginTop: 12 }}>Save details</button>
    </form>
  );
}

function Orders() {
  const [orders, setOrders] = useState(null);
  const [open, setOpen] = useState(null);
  useEffect(() => { api("GET", "/api/web/account/orders").then((r) => setOrders(r.ok ? r.payload || [] : [])); }, []);
  return (
    <div className="card acc-card">
      <h2>My orders</h2>
      {orders === null && <p className="sub">Loading…</p>}
      {orders?.length === 0 && <p className="sub">No orders yet. <Link href="/products" style={{ color: "var(--link)", fontWeight: 600 }}>Start shopping</Link></p>}
      <div className="acc-orders">
        {orders?.map((o) => (
          <div key={o.OrderId} className="acc-order">
            <button type="button" onClick={() => setOpen(open === o.OrderId ? null : o.OrderId)} aria-expanded={open === o.OrderId}>
              <strong>{o.OrderNo}</strong>
              <span>{new Date(o.CreatedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</span>
              <span className={`acc-st st-${o.Status}`}>{STATUS[o.Status] || o.Status}</span>
              <span className="acc-tot">{lkr(o.Total)}</span>
            </button>
            {open === o.OrderId && (
              <ul>
                {(o.lines || []).map((l, i) => <li key={i}><span>{l.Qty} × {l.ItemName}</span><span>{lkr(l.LineTotal)}</span></li>)}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Account() {
  const [me, setMe] = useState(undefined);
  const load = () => api("GET", "/api/web/account/me").then((r) => setMe(r.ok ? r.payload : null));
  useEffect(() => { load(); }, []);

  async function logout() {
    await api("POST", "/api/web/account/logout", {});
    setMe(null);
  }

  return (
    <div className="wrap">
      <nav aria-label="Breadcrumb" className="crumbs"><Link href="/">Home</Link><span aria-hidden="true">/</span><strong>My account</strong></nav>
      <div className="acc-head">
        <div>
          <h1 className="page-title">{me ? `Hello, ${me.name.split(" ")[0]}` : "My account"}</h1>
          <p className="lead">{me ? "Your orders and saved delivery details." : "Sign in to see your orders and check out faster."}</p>
        </div>
        {me && <button className="btn" onClick={logout}>Sign out</button>}
      </div>
      {me === undefined && <p className="sub">Loading…</p>}
      {me === null && <SignIn onDone={load} />}
      {me && (
        <div className="acc-grid">
          <Orders />
          <Profile me={me} onSaved={load} />
        </div>
      )}
    </div>
  );
}

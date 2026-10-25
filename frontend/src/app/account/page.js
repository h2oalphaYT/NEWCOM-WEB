"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/apiClient";
import { lkr, site, whatsappLink } from "@/lib/site";

const provinces = ["Western", "Central", "Southern", "Northern", "Eastern", "North Western", "North Central", "Uva", "Sabaragamuwa"];
const STATUS = { new: "Received", confirmed: "Confirmed", paid: "Paid", shipped: "On the way", completed: "Completed", cancelled: "Cancelled" };
const FLOW = ["new", "confirmed", "paid", "shipped", "completed"];
const PAY = { card: "Card", koko: "KOKO", mintpay: "Mintpay", bank: "Bank transfer", store: "Pay in store" };

const Ico = ({ d, size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>
);
const I = {
  box: "M21 8 12 3 3 8v8l9 5 9-5zM3 8l9 5 9-5M12 13v8",
  bolt: "M13 2 4 14h7l-1 8 9-12h-7z",
  shield: "M12 3 5 6v5c0 4.4 3 8.2 7 9.5 4-1.3 7-5.1 7-9.5V6zM9 12l2 2 4-4",
  tag: "M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8zM7.5 7.5h.01",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0",
  mail: "M4 5h16v14H4zM4 6l8 7 8-7",
  lock: "M6 11h12v10H6zM8 11V7a4 4 0 0 1 8 0v4",
  phone: "M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z",
  eye: "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  eyeOff: "M3 3l18 18M10.6 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4.2M6.6 6.6C3.9 8.4 2 12 2 12s3.5 7 10 7c1.7 0 3.2-.4 4.5-1.1M9.9 9.9a3 3 0 0 0 4.2 4.2",
  pin: "M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11zM12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
  out: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9",
  chev: "m6 9 6 6 6-6",
};

function Input({ icon, label, type = "text", value, onChange, ac, required, minLength, mode, hint }) {
  const [show, setShow] = useState(false);
  const pw = type === "password";
  return (
    <label className="ac-field">
      <span className="ac-label">{label}</span>
      <span className="ac-input">
        {icon && <Ico d={I[icon]} size={18} />}
        <input type={pw && show ? "text" : type} value={value} onChange={onChange} autoComplete={ac} required={required} minLength={minLength} inputMode={mode} />
        {pw && (
          <button type="button" className="ac-eye" onClick={() => setShow(!show)} aria-label={show ? "Hide password" : "Show password"}>
            <Ico d={show ? I.eyeOff : I.eye} size={18} />
          </button>
        )}
      </span>
      {hint && <span className="ac-hint">{hint}</span>}
    </label>
  );
}

function SignIn({ onDone }) {
  const [mode, setMode] = useState("login");
  const [f, setF] = useState({ name: "", email: "", mobile: "", password: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => { setF({ ...f, [k]: e.target.value }); setErr(""); };
  const reg = mode === "register";

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    const r = reg
      ? await api("POST", "/api/web/account/register", { name: f.name, email: f.email, mobile: f.mobile.replace(/[\s-]/g, ""), password: f.password })
      : await api("POST", "/api/web/account/login", { email: f.email, password: f.password });
    setBusy(false);
    if (r.ok) onDone();
    else setErr(r.message || "Something went wrong. Please try again.");
  }

  const perks = [
    ["box", "Track every order", "See status and items for everything you buy online."],
    ["bolt", "Faster checkout", "Your name, mobile and address are filled in for you."],
    ["tag", "Members-first offers", "Promo codes and deals before they hit the top bar."],
    ["shield", "Warranty made easy", "Keep your invoices and claims in one place."],
  ];

  return (
    <div className="ac-auth">
      <aside className="ac-side">
        <img src="/media/cat/desktop.webp" alt="" className="ac-side-img" />
        <div className="ac-side-shade" aria-hidden="true" />
        <div className="ac-side-in">
          <img src="/brand/newcom-logo-dark.png" alt="Newcom" className="ac-side-logo" />
          <h2>{reg ? "Join Newcom" : "Welcome back"}</h2>
          <p>{reg ? "One account for orders, delivery details and warranty." : "Sign in to see your orders and check out in seconds."}</p>
          <ul>
            {perks.map(([ic, t, s]) => (
              <li key={t}><span className="ac-perk-ico"><Ico d={I[ic]} /></span><span><strong>{t}</strong><em>{s}</em></span></li>
            ))}
          </ul>
        </div>
      </aside>

      <div className="ac-card">
        <div className="ac-switch" role="tablist" aria-label="Account">
          <button type="button" role="tab" aria-selected={!reg} className={!reg ? "on" : ""} onClick={() => { setMode("login"); setErr(""); }}>Sign in</button>
          <button type="button" role="tab" aria-selected={reg} className={reg ? "on" : ""} onClick={() => { setMode("register"); setErr(""); }}>Create account</button>
          <span className="ac-switch-pill" style={{ transform: reg ? "translateX(100%)" : "none" }} aria-hidden="true" />
        </div>
        <h1 className="ac-title">{reg ? "Create your account" : "Sign in to Newcom"}</h1>
        <p className="ac-sub">{reg ? "It takes less than a minute." : "Use the email you shop with."}</p>
        <form onSubmit={submit} className="ac-form" key={mode}>
          {reg && <Input icon="user" label="Full name" value={f.name} onChange={set("name")} ac="name" required />}
          {reg && <Input icon="phone" label="Mobile number" value={f.mobile} onChange={set("mobile")} ac="tel" mode="tel" required hint="Sri Lankan mobile, e.g. 077 123 4567" />}
          <Input icon="mail" label="Email" type="email" value={f.email} onChange={set("email")} ac="email" required />
          <Input icon="lock" label="Password" type="password" value={f.password} onChange={set("password")} ac={reg ? "new-password" : "current-password"} required minLength={reg ? 8 : undefined} hint={reg ? "At least 8 characters" : undefined} />
          {err && <div className="ac-err" role="alert">{err}</div>}
          <button className="btn btn-primary ac-submit" disabled={busy}>{busy ? "Please wait…" : reg ? "Create account" : "Sign in"}</button>
          {reg
            ? <p className="ac-note">Ordered before as a guest? Use the same email and your earlier orders appear here.</p>
            : <p className="ac-note">Forgot your password? <a href={whatsappLink("Hi Newcom, I need help resetting my website account password.")} target="_blank" rel="noopener noreferrer">Message us on WhatsApp</a> and we'll help.</p>}
        </form>
        <div className="ac-guest">No account needed to buy. <Link href="/cart">Check out as a guest →</Link></div>
      </div>
    </div>
  );
}

function OrderCard({ o }) {
  const [open, setOpen] = useState(false);
  const step = FLOW.indexOf(o.Status);
  const date = new Date(o.CreatedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const items = (o.lines || []).reduce((a, l) => a + (Number(l.Qty) || 0), 0);
  return (
    <div className={`ac-order${open ? " open" : ""}`}>
      <button type="button" className="ac-order-h" onClick={() => setOpen(!open)} aria-expanded={open}>
        <span className="ac-order-ico"><Ico d={I.box} /></span>
        <span className="ac-order-main">
          <strong>{o.OrderNo}</strong>
          <em>{date} · {items} {items === 1 ? "item" : "items"} · {PAY[o.PaymentMethod] || o.PaymentMethod}</em>
        </span>
        <span className={`ac-st st-${o.Status}`}>{STATUS[o.Status] || o.Status}</span>
        <span className="ac-order-tot">{lkr(o.Total)}</span>
        <span className="ac-chev"><Ico d={I.chev} size={18} /></span>
      </button>
      {open && (
        <div className="ac-order-b">
          {o.Status !== "cancelled" && (
            <ol className="ac-track">
              {FLOW.map((s, i) => <li key={s} className={i <= step ? "on" : ""}><span />{STATUS[s]}</li>)}
            </ol>
          )}
          <ul className="ac-lines">
            {(o.lines || []).map((l, i) => (
              <li key={i}><span><b>{l.Qty} ×</b> {l.ItemName}</span><span>{lkr(l.LineTotal)}</span></li>
            ))}
          </ul>
          <div className="ac-order-help">
            Questions about this order? <a href={whatsappLink(`Hi Newcom, about my order ${o.OrderNo}.`)} target="_blank" rel="noopener noreferrer">WhatsApp us</a> or call {site.phone}.
          </div>
        </div>
      )}
    </div>
  );
}

function Orders({ orders }) {
  if (orders === null) return <div className="ac-panel"><div className="ac-skel" /><div className="ac-skel" /></div>;
  if (orders.length === 0) return (
    <div className="ac-panel ac-empty">
      <span className="ac-empty-ico"><Ico d={I.box} size={28} /></span>
      <strong>No orders yet</strong>
      <p>When you place an order it shows up here with its status.</p>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
        <Link className="btn btn-primary" href="/products">Start shopping</Link>
        <Link className="btn" href="/prebuilt">Pre-built PCs</Link>
      </div>
    </div>
  );
  return <div className="ac-orders">{orders.map((o) => <OrderCard key={o.OrderId} o={o} />)}</div>;
}

function Details({ me, onSaved }) {
  const [f, setF] = useState(me);
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => { setF({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }); setMsg(null); };
  async function save(e) {
    e.preventDefault();
    setBusy(true);
    const r = await api("PUT", "/api/web/account/me", { ...f, mobile: (f.mobile || "").replace(/[\s-]/g, "") });
    setBusy(false);
    setMsg(r.ok ? { t: "Your details are saved." } : { bad: true, t: r.message || "Couldn't save" });
    if (r.ok) onSaved();
  }
  return (
    <form className="ac-panel" onSubmit={save}>
      <div className="ac-panel-h"><h2>Personal details</h2><p>Used to fill in checkout and to contact you about orders.</p></div>
      <div className="ac-grid2">
        <Input icon="user" label="Full name" value={f.name || ""} onChange={set("name")} ac="name" required />
        <Input icon="phone" label="Mobile number" value={f.mobile || ""} onChange={set("mobile")} ac="tel" mode="tel" />
      </div>
      <div className="ac-panel-h" style={{ marginTop: 26 }}><h2>Delivery address</h2><p>Your default address for island-wide delivery.</p></div>
      <div className="ac-grid2">
        <div className="ac-wide"><Input icon="pin" label="Street address" value={f.address || ""} onChange={set("address")} ac="street-address" /></div>
        <Input label="Town or city" value={f.city || ""} onChange={set("city")} ac="address-level2" />
        <Input label="District" value={f.district || ""} onChange={set("district")} ac="off" />
        <label className="ac-field">
          <span className="ac-label">Province</span>
          <span className="ac-input"><select value={f.province || ""} onChange={set("province")}><option value="">Select…</option>{provinces.map((p) => <option key={p}>{p}</option>)}</select></span>
        </label>
      </div>
      <label className="ac-toggle">
        <input type="checkbox" checked={!!f.newsletter} onChange={set("newsletter")} />
        <span className="ac-toggle-ui" aria-hidden="true" />
        <span><strong>Offers by email</strong><em>New arrivals, promo codes and member deals. Unsubscribe any time.</em></span>
      </label>
      {msg && <div className={msg.bad ? "ac-err" : "ac-ok"} role="status">{msg.t}</div>}
      <button className="btn btn-primary" style={{ marginTop: 18 }} disabled={busy}>{busy ? "Saving…" : "Save changes"}</button>
    </form>
  );
}

function Profile({ me, reload, onLogout }) {
  const [tab, setTab] = useState("orders");
  const [orders, setOrders] = useState(null);
  useEffect(() => { api("GET", "/api/web/account/orders").then((r) => setOrders(r.ok ? r.payload || [] : [])); }, []);
  const initials = me.name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  const live = (orders || []).filter((o) => o.Status !== "cancelled");
  const spent = live.reduce((a, o) => a + (Number(o.Total) || 0), 0);
  const open = live.filter((o) => o.Status !== "completed").length;

  return (
    <>
      <section className="ac-hero">
        <div className="ac-hero-glow" aria-hidden="true" />
        <div className="ac-avatar" aria-hidden="true">{initials || "N"}</div>
        <div className="ac-hero-txt">
          <span className="ac-hello">My account</span>
          <h1>Hello, {me.name.split(" ")[0]}</h1>
          <p>{me.email}{me.mobile ? ` · ${me.mobile}` : ""}</p>
        </div>
        <button className="ac-logout" onClick={onLogout}><Ico d={I.out} size={18} />Sign out</button>
        <div className="ac-stats">
          <div><strong>{orders ? orders.length : "–"}</strong><span>Orders</span></div>
          <div><strong>{orders ? open : "–"}</strong><span>In progress</span></div>
          <div><strong>{orders ? lkr(spent) : "–"}</strong><span>Total spent</span></div>
        </div>
      </section>

      <div className="ac-tabs" role="tablist">
        {[["orders", "My orders"], ["details", "Details and address"]].map(([k, t]) => (
          <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? "on" : ""} onClick={() => setTab(k)}>{t}</button>
        ))}
      </div>

      <div className="ac-body">
        <div className="ac-main">{tab === "orders" ? <Orders orders={orders} /> : <Details me={me} onSaved={reload} />}</div>
        <aside className="ac-aside">
          <Link href="/support/warranty" className="ac-quick"><span><Ico d={I.shield} /></span><strong>Warranty claim</strong><em>Submit or track a repair</em></Link>
          <Link href="/prebuilt" className="ac-quick"><span><Ico d={I.box} /></span><strong>Pre-built PCs</strong><em>Ready-made office and gaming builds</em></Link>
          <a href={whatsappLink("Hi Newcom, I need some help.")} target="_blank" rel="noopener noreferrer" className="ac-quick"><span><Ico d={I.phone} /></span><strong>Need help?</strong><em>WhatsApp {site.whatsapp}</em></a>
        </aside>
      </div>
    </>
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
    <div className="wrap ac-wrap">
      <nav aria-label="Breadcrumb" className="crumbs"><Link href="/">Home</Link><span aria-hidden="true">/</span><strong>My account</strong></nav>
      {me === undefined && <div className="ac-loading"><div className="ac-skel tall" /></div>}
      {me === null && <SignIn onDone={load} />}
      {me && <Profile me={me} reload={load} onLogout={logout} />}
    </div>
  );
}

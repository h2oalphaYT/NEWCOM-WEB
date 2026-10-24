"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { site } from "@/lib/site";

// Warranty claim (RMA) portal. Prototype: tickets are kept in this browser only. Email
// confirmations and real status updates need the backend and a mail service.
const KEY = "newcom-rma";
const STAGES = ["Submitted", "Received at service centre", "Diagnosis", "Repair or replacement", "Ready for collection"];
const blank = { name: "", phone: "", email: "", invoice: "", product: "", serial: "", issue: "", branch: "" };

export default function WarrantyPortal() {
  const [tab, setTab] = useState("new");
  const [f, setF] = useState({ ...blank, branch: site.branches[0] });
  const [errs, setErrs] = useState({});
  const [tickets, setTickets] = useState([]);
  const [done, setDone] = useState(null);
  const [lookup, setLookup] = useState("");
  const [found, setFound] = useState(undefined);

  useEffect(() => { try { setTickets(JSON.parse(localStorage.getItem(KEY) || "[]")); } catch {} }, []);
  const persist = (list) => { setTickets(list); try { localStorage.setItem(KEY, JSON.stringify(list)); } catch {} };
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  function submit(e) {
    e.preventDefault();
    const er = {};
    if (!f.name.trim()) er.name = "Enter your name.";
    if (!/^(\+94|0)?7\d{8}$/.test(f.phone.replace(/[\s-]/g, ""))) er.phone = "Enter a Sri Lankan mobile number.";
    if (f.email && !/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(f.email)) er.email = "Enter a valid email or leave it blank.";
    if (!f.invoice.trim()) er.invoice = "Enter the invoice or order number.";
    if (!f.product.trim()) er.product = "Enter the product name or model.";
    if (!f.serial.trim()) er.serial = "Enter the serial number from the product label.";
    if (f.issue.trim().length < 10) er.issue = "Describe the problem in a sentence or two.";
    setErrs(er);
    if (Object.keys(er).length) return;
    const id = `RMA-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 90000) + 10000)}`;
    const t = { id, ...f, stage: 0, created: new Date().toISOString() };
    persist([t, ...tickets]);
    setDone(t);
    setF({ ...blank, branch: site.branches[0] });
  }

  function track(e) {
    e.preventDefault();
    setFound(tickets.find((t) => t.id.toLowerCase() === lookup.trim().toLowerCase()) || null);
  }

  const field = (k, label, props = {}) => (
    <label className="fl" style={props.wide ? { gridColumn: "1 / -1" } : undefined}>{label}
      {props.area ? <textarea className="in ta" value={f[k]} onChange={set(k)} rows={4} /> : <input className="in" value={f[k]} onChange={set(k)} inputMode={props.mode} autoComplete={props.ac} />}
      <span className="err" role="alert">{errs[k] || ""}</span>
    </label>
  );

  const Timeline = ({ t }) => (
    <ol className="rma-steps">
      {STAGES.map((s, i) => <li key={s} className={i <= t.stage ? "done" : ""}><span>{i <= t.stage ? "✓" : i + 1}</span>{s}</li>)}
    </ol>
  );

  return (
    <div className="wrap">
      <nav aria-label="Breadcrumb" className="crumbs"><Link href="/">Home</Link><span aria-hidden="true">/</span><strong>Warranty claims</strong></nav>
      <h1 className="page-title">Warranty claims</h1>
      <p className="lead">Submit a warranty request and track it with your ticket number. For urgent help call {site.phone} or WhatsApp {site.whatsapp}.</p>

      <div className="seg" role="tablist" style={{ marginTop: 24 }}>
        <button role="tab" aria-selected={tab === "new"} className={tab === "new" ? "on" : ""} onClick={() => setTab("new")}>New claim</button>
        <button role="tab" aria-selected={tab === "track"} className={tab === "track" ? "on" : ""} onClick={() => setTab("track")}>Track a claim</button>
      </div>

      {tab === "new" && (done ? (
        <div className="done step" style={{ marginTop: 24 }}>
          <div className="done-tick">✓</div>
          <h2 style={{ marginTop: 16, fontSize: 24, fontWeight: 800 }}>Claim {done.id} submitted</h2>
          <p>Keep this number to track your claim. Bring the product and invoice to our {done.branch} branch. In this prototype the claim is saved in this browser only; the live site will email a confirmation{done.email ? ` to ${done.email}` : ""}.</p>
          <Timeline t={done} />
          <div style={{ display: "flex", gap: 10, marginTop: 20, flexWrap: "wrap" }}>
            <button className="btn" onClick={() => setDone(null)}>Submit another</button>
            <button className="btn btn-dark" onClick={() => { setTab("track"); setLookup(done.id); setFound(done); }}>Track this claim</button>
          </div>
        </div>
      ) : (
        <form className="card step" onSubmit={submit} noValidate style={{ marginTop: 24, padding: 24 }}>
          <div className="cform" style={{ marginTop: 0 }}>
            {field("name", "Full name", { ac: "name" })}
            {field("phone", "Mobile number", { mode: "tel", ac: "tel" })}
            {field("email", "Email (for updates)", { ac: "email" })}
            {field("invoice", "Invoice or order number")}
            {field("product", "Product and model")}
            {field("serial", "Serial number")}
            <label className="fl">Drop-off branch
              <select className="in" value={f.branch} onChange={set("branch")}>{site.branches.map((b) => <option key={b}>{b}</option>)}</select>
              <span className="err" />
            </label>
            {field("issue", "What is the problem?", { area: true, wide: true })}
          </div>
          <button type="submit" className="btn btn-primary" style={{ marginTop: 8 }}>Submit claim</button>
        </form>
      ))}

      {tab === "track" && (
        <div style={{ marginTop: 24, maxWidth: 720 }}>
          <form onSubmit={track} style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <label className="sr-only" htmlFor="rma">Ticket number</label>
            <input id="rma" className="in" style={{ flex: "1 1 240px", width: "auto" }} placeholder="e.g. RMA-2026-12345" value={lookup} onChange={(e) => setLookup(e.target.value)} />
            <button className="btn btn-primary">Track</button>
          </form>
          {found === null && <div className="notice">No claim found with that number on this device. Check the number or contact us.</div>}
          {found && (
            <div className="card step" style={{ marginTop: 16, padding: 24 }}>
              <div className="slot-label">{found.id} · {found.branch}</div>
              <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 6 }}>{found.product}</h2>
              <p className="sub" style={{ fontSize: 14 }}>Serial {found.serial} · submitted {new Date(found.created).toLocaleDateString("en-GB")}</p>
              <Timeline t={found} />
            </div>
          )}
          {tickets.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <div className="slot-label">Claims on this device</div>
              <div className="chips">{tickets.map((t) => <button key={t.id} className="chip" onClick={() => { setLookup(t.id); setFound(t); }}>{t.id}</button>)}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { parts, slotOrder, partMeta, compatibilityChecks, estimateWatts } from "@/lib/parts";
import { lkr, whatsappLink } from "@/lib/site";

const checkStyle = {
  ok: ["var(--okbg)", "#15803D", "✓"],
  bad: ["var(--badbg)", "#B91C1C", "!"],
  warn: ["var(--warnbg)", "#B45309", "?"],
  pending: ["var(--bg)", "#94A3B8", "–"],
};

const mobileOk = (v) => /^(\+94|0)?7\d{8}$/.test(v.replace(/[\s-]/g, ""));

export default function PcBuilder() {
  const [pick, setPick] = useState({});
  const [open, setOpen] = useState("cpu");
  const [quote, setQuote] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [err, setErr] = useState("");

  const sel = Object.fromEntries(slotOrder.map(([k]) => [k, parts[k].find((p) => p.id === pick[k])]));
  const checks = compatibilityChecks(sel);
  const watts = estimateWatts(sel);
  const total = slotOrder.reduce((a, [k]) => a + (sel[k] ? sel[k].price : 0), 0);

  function sendQuote(e) {
    e.preventDefault();
    if (!name.trim()) return setErr("Enter your name.");
    if (!mobileOk(phone)) return setErr("Enter a Sri Lankan mobile number.");
    if (!total) return setErr("Choose at least one part first.");
    const lines = slotOrder.filter(([k]) => sel[k]).map(([k, label]) => `${label}: ${sel[k].name} (${lkr(sel[k].price)})`);
    const text = `Hi Newcom, I'd like a quotation for this PC build.\n\n${lines.join("\n")}\n\nEstimated total: ${lkr(total)}\nName: ${name.trim()}\nMobile: ${phone.trim()}`;
    window.open(whatsappLink(text), "_blank", "noopener,noreferrer");
    setErr("");
  }

  return (
    <div className="builder">
      <div className="slots">
        {slotOrder.map(([k, label], i) => {
          const chosen = sel[k];
          const isOpen = open === k;
          return (
            <section key={k} className="card slot">
              <div className="slot-head">
                <span className="slot-n">{i + 1}</span>
                <div style={{ flex: "1 1 200px", minWidth: 0 }}>
                  <div className="slot-label">{label}</div>
                  <div className="slot-choice">{chosen ? chosen.name : "Not selected"}</div>
                </div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{chosen ? lkr(chosen.price) : ""}</div>
                <button className={`slot-btn${chosen ? " chosen" : ""}`} onClick={() => setOpen(isOpen ? "" : k)} aria-expanded={isOpen}>
                  {isOpen ? "Close" : chosen ? "Change" : "Choose"}
                </button>
              </div>
              {isOpen && (
                <div className="opts msg">
                  {parts[k].map((p) => (
                    <button key={p.id} className={`opt${pick[k] === p.id ? " on" : ""}`} onClick={() => { setPick({ ...pick, [k]: p.id }); setOpen(""); }}>
                      <span style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.4 }}>{p.name}</span>
                      <span style={{ fontSize: 12, color: "var(--mute)", marginTop: 4 }}>{partMeta[k](p)}</span>
                      <span style={{ fontSize: 14, fontWeight: 700, marginTop: 8 }}>{lkr(p.price)}</span>
                    </button>
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>

      <aside className="summary" aria-label="Build summary">
        <div className="card" style={{ padding: 22, background: "var(--surface)" }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>Compatibility</h2>
          <div style={{ marginTop: 12, display: "grid", gap: 8 }} aria-live="polite">
            {checks.map((c) => {
              const [bg, dot, icon] = checkStyle[c.st];
              return (
                <div key={c.t} className="check msg" style={{ background: bg }}>
                  <span aria-hidden="true" className="check-dot" style={{ background: dot }}>{icon}</span>
                  <span><strong style={{ fontWeight: 700 }}>{c.t}</strong><span style={{ display: "block", color: "var(--ink2)" }}>{c.s}</span></span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card" style={{ padding: 22 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <span style={{ fontSize: 14, fontWeight: 600 }}>Estimated total</span>
            <span key={total} className="tot">{lkr(total)}</span>
          </div>
          <div style={{ marginTop: 6, fontSize: 13, color: "var(--mute)" }}>
            Estimated power draw: {watts ? `${watts}W (CPU + GPU + 100W allowance)` : "select a CPU or GPU"}
          </div>
          <div style={{ marginTop: 18, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button className="btn" onClick={() => { setPick({}); setOpen("cpu"); }}>Reset</button>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => setQuote(!quote)}>Request a quotation</button>
          </div>
          {quote && (
            <form className="msg" onSubmit={sendQuote} noValidate style={{ marginTop: 18, borderTop: "1px solid var(--line)", paddingTop: 18, display: "grid", gap: 10 }}>
              <label style={{ fontSize: 13, fontWeight: 600 }}>Your name
                <input className="in" value={name} onChange={(e) => { setName(e.target.value); setErr(""); }} aria-invalid={!!err && !name.trim()} style={{ marginTop: 4 }} />
              </label>
              <label style={{ fontSize: 13, fontWeight: 600 }}>Mobile number
                <input className="in" value={phone} inputMode="tel" onChange={(e) => { setPhone(e.target.value); setErr(""); }} aria-invalid={!!err && !mobileOk(phone)} style={{ marginTop: 4 }} />
              </label>
              <div role="alert" style={{ minHeight: 18, fontSize: 12, color: "var(--err)" }}>{err}</div>
              <button type="submit" className="btn btn-dark">Send on WhatsApp</button>
            </form>
          )}
        </div>
      </aside>
    </div>
  );
}

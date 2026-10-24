"use client";

import { useEffect, useMemo, useState } from "react";
import Builder3D from "@/components/Builder3D";
import { useCart } from "@/components/CartProvider";
import {
  ACCESSORIES, ALL_SLOTS, ESSENTIALS, REQUIRED, compatibilityChecks, decodeBuild, encodeBuild,
  estimateWatts, metaFor, optionsFor, partById, templates,
} from "@/lib/builder";
import { lkr, site, whatsappLink } from "@/lib/site";

const checkStyle = {
  ok: ["var(--okbg)", "#15803D", "✓"],
  bad: ["var(--badbg)", "#B91C1C", "!"],
  warn: ["var(--warnbg)", "#B45309", "?"],
  pending: ["var(--bg)", "#94A3B8", "–"],
};
const SAVE_KEY = "newcom-saved-build";
const mobileOk = (v) => /^(\+94|0)?7\d{8}$/.test(v.replace(/[\s-]/g, ""));

// PC Builder v3: platform toggle, essentials/accessories, templates, live price, wattage and
// compatibility, 3D fitting preview, print quotation, add to cart, save and share.
export default function PcBuilder() {
  const cart = useCart();
  const [platform, setPlatform] = useState("amd");
  const [pick, setPick] = useState({});
  const [group, setGroup] = useState("ess");
  const [open, setOpen] = useState("case");
  const [auto, setAuto] = useState(true);
  const [focus, setFocus] = useState("");
  const [note, setNote] = useState("");
  const [quote, setQuote] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [err, setErr] = useState("");
  const [hasSaved, setHasSaved] = useState(false);

  // load a shared build from ?b=… on first visit
  useEffect(() => {
    const code = new URLSearchParams(location.search).get("b");
    const b = code && decodeBuild(code);
    if (b) { setPlatform(b.platform); setPick(b.pick); setOpen(""); flash("Shared build loaded."); }
    try { setHasSaved(!!localStorage.getItem(SAVE_KEY)); } catch {}
  }, []);

  const sel = useMemo(() => Object.fromEntries(ALL_SLOTS.map(([k]) => [k, partById(pick[k])])), [pick]);
  const checks = compatibilityChecks(sel);
  const watts = estimateWatts(sel);
  const total = ALL_SLOTS.reduce((a, [k]) => a + (sel[k]?.price || 0), 0);
  const chosen = ALL_SLOTS.filter(([k]) => sel[k]);
  const missing = REQUIRED.filter((k) => !sel[k]);
  const bad = checks.filter((c) => c.st === "bad").length;
  const slots = group === "ess" ? ESSENTIALS : ACCESSORIES;

  function flash(msg) {
    setNote(msg);
    clearTimeout(flash.t);
    flash.t = setTimeout(() => setNote(""), 2600);
  }

  function choose(slot, id) {
    const next = { ...pick, [slot]: id };
    setPick(next);
    setFocus(slot);
    if (!auto) { setOpen(""); return; }
    const order = slots.map(([k]) => k);
    const after = order.slice(order.indexOf(slot) + 1).concat(order.slice(0, order.indexOf(slot)));
    setOpen(after.find((k) => !next[k]) || "");
  }

  function switchPlatform(p) {
    if (p === platform) return;
    setPlatform(p);
    // drop parts that only work on the other platform
    setPick((cur) => Object.fromEntries(Object.entries(cur).filter(([, id]) => { const part = partById(id); return !part?.platform || part.platform === p; })));
    setOpen(sel.case ? "mb" : "case");
  }

  function loadTemplate(t) {
    setPlatform(t.platform);
    setPick({ ...t.parts });
    setGroup("ess");
    setOpen("");
    setFocus("case");
    flash(`${t.name} loaded. Change any part you like.`);
  }

  function shareLink() {
    const url = `${location.origin}/pc-builder?b=${encodeBuild(platform, pick)}`;
    history.replaceState(null, "", url);
    navigator.clipboard?.writeText(url).then(() => flash("Share link copied."), () => flash("Share link is in the address bar."));
  }

  function save() {
    try { localStorage.setItem(SAVE_KEY, encodeBuild(platform, pick)); setHasSaved(true); flash("Build saved on this device."); } catch { flash("Could not save in this browser."); }
  }

  function loadSaved() {
    try { const b = decodeBuild(localStorage.getItem(SAVE_KEY)); if (b) { setPlatform(b.platform); setPick(b.pick); setOpen(""); flash("Saved build loaded."); } } catch {}
  }

  function addToCart() {
    if (!chosen.length) return flash("Choose some parts first.");
    cart.addMany(chosen.map(([k]) => sel[k].id));
  }

  function sendQuote(e) {
    e.preventDefault();
    if (!name.trim()) return setErr("Enter your name.");
    if (!mobileOk(phone)) return setErr("Enter a Sri Lankan mobile number.");
    if (!total) return setErr("Choose at least one part first.");
    const lines = chosen.map(([k, label]) => `${label}: ${sel[k].name} (${lkr(sel[k].price)})`);
    const text = `Hi Newcom, I'd like a quotation for this PC build.\n\n${lines.join("\n")}\n\nEstimated total: ${lkr(total)}\nName: ${name.trim()}\nMobile: ${phone.trim()}`;
    window.open(whatsappLink(text), "_blank", "noopener,noreferrer");
    setErr("");
  }

  const psuW = sel.psu?.w || 0;
  const meter = psuW ? Math.min(100, Math.round((watts / psuW) * 100)) : 0;

  return (
    <>
      <div className="no-print">
        {/* templates */}
        <section className="tpl-row" aria-label="Ready-made builds">
          {templates.map((t) => {
            const sum = Object.values(t.parts).reduce((a, id) => a + (partById(id)?.price || 0), 0);
            return (
              <button key={t.id} className="tpl" onClick={() => loadTemplate(t)}>
                <span className="tpl-tag">{t.tag}</span>
                <strong>{t.name}</strong>
                <span className="tpl-note">{t.note} · {t.platform === "amd" ? "AMD Ryzen" : "Intel"}</span>
                <span className="tpl-price">{lkr(sum)}</span>
              </button>
            );
          })}
        </section>

        <div className="builder">
          <div className="slots">
            <div className="bv-bar">
              <div className="seg" role="radiogroup" aria-label="Platform">
                {[["intel", "Intel"], ["amd", "AMD Ryzen"]].map(([k, l]) => (
                  <button key={k} role="radio" aria-checked={platform === k} className={platform === k ? `on ${k}` : ""} onClick={() => switchPlatform(k)}>{l}</button>
                ))}
              </div>
              <div className="seg" role="tablist" aria-label="Part group">
                <button role="tab" aria-selected={group === "ess"} className={group === "ess" ? "on" : ""} onClick={() => { setGroup("ess"); setOpen(ESSENTIALS.find(([k]) => !pick[k])?.[0] || ""); }}>Essentials</button>
                <button role="tab" aria-selected={group === "acc"} className={group === "acc" ? "on" : ""} onClick={() => { setGroup("acc"); setOpen(""); }}>Accessories</button>
              </div>
              <label className="auto"><input type="checkbox" checked={auto} onChange={(e) => setAuto(e.target.checked)} />Auto-advance</label>
            </div>

            {slots.map(([k, label], i) => {
              const c = sel[k];
              const isOpen = open === k;
              const opts = optionsFor(k, platform);
              return (
                <section key={k} className="card slot">
                  <div className="slot-head">
                    <span className="slot-n" style={c ? { background: "#15803D", color: "#fff" } : undefined}>{c ? "✓" : i + 1}</span>
                    <div style={{ flex: "1 1 200px", minWidth: 0 }}>
                      <div className="slot-label">{label}{REQUIRED.includes(k) && !c ? " · required" : ""}</div>
                      <div className="slot-choice">{c ? c.name : "Not selected"}</div>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{c ? lkr(c.price) : ""}</div>
                    {c && <button className="slot-x" onClick={() => { const n = { ...pick }; delete n[k]; setPick(n); }} aria-label={`Remove ${label}`}>×</button>}
                    <button className={`slot-btn${c ? " chosen" : ""}`} onClick={() => setOpen(isOpen ? "" : k)} aria-expanded={isOpen}>{isOpen ? "Close" : c ? "Change" : "Choose"}</button>
                  </div>
                  {isOpen && (
                    <div className="opts msg">
                      {opts.map((p) => (
                        <button key={p.id} className={`opt${pick[k] === p.id ? " on" : ""}`} onClick={() => choose(k, p.id)}>
                          <span style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.4 }}>{p.name}</span>
                          <span style={{ fontSize: 12, color: "var(--mute)", marginTop: 4 }}>{metaFor(p)}</span>
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
            <Builder3D sel={sel} focus={focus} />

            <div className="card" style={{ padding: 22 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontSize: 14, fontWeight: 600 }}>Estimated total</span>
                <span key={total} className="tot">{lkr(total)}</span>
              </div>
              <div className="watt">
                <div className="watt-top"><span>Estimated power draw</span><strong>{watts ? `${watts}W` : "–"}{psuW ? ` / ${psuW}W` : ""}</strong></div>
                <div className="watt-bar" aria-hidden="true"><div style={{ width: `${meter}%`, background: meter > 85 ? "#B91C1C" : meter > 70 ? "#B45309" : "#15803D" }} /></div>
                <div className="watt-sub">{psuW ? `${meter}% of PSU capacity. Aim for under 70% for headroom.` : watts ? `Recommended PSU: ${Math.ceil((watts * 1.4) / 50) * 50}W or more.` : "Pick parts to estimate."}</div>
              </div>
              {note && <div role="status" className="b-note msg">{note}</div>}
              <div className="b-actions">
                <button className="btn btn-primary" onClick={addToCart} disabled={!chosen.length}>Add build to cart</button>
                <button className="btn" onClick={() => window.print()} disabled={!chosen.length}>Print quotation</button>
                <button className="btn" onClick={shareLink} disabled={!chosen.length}>Share link</button>
                <button className="btn" onClick={save} disabled={!chosen.length}>Save build</button>
                {hasSaved && <button className="btn" onClick={loadSaved}>Load saved</button>}
                <button className="btn" onClick={() => { setPick({}); setOpen("case"); setGroup("ess"); }}>Reset</button>
              </div>
              <button className="btn btn-dark" style={{ width: "100%", marginTop: 10 }} onClick={() => setQuote(!quote)}>Ask for a quotation on WhatsApp</button>
              {quote && (
                <form className="msg" onSubmit={sendQuote} noValidate style={{ marginTop: 14, display: "grid", gap: 10 }}>
                  <label style={{ fontSize: 13, fontWeight: 600 }}>Your name<input className="in" value={name} onChange={(e) => { setName(e.target.value); setErr(""); }} style={{ marginTop: 4 }} /></label>
                  <label style={{ fontSize: 13, fontWeight: 600 }}>Mobile number<input className="in" value={phone} inputMode="tel" onChange={(e) => { setPhone(e.target.value); setErr(""); }} style={{ marginTop: 4 }} /></label>
                  <div role="alert" style={{ minHeight: 18, fontSize: 12, color: "var(--err)" }}>{err}</div>
                  <button type="submit" className="btn btn-primary">Send on WhatsApp</button>
                </form>
              )}
            </div>

            <div className="card" style={{ padding: 22, background: "var(--surface)" }}>
              <h2 style={{ fontSize: 18, fontWeight: 700 }}>Compatibility {bad ? <span className="pill bad">{bad} issue{bad > 1 ? "s" : ""}</span> : null}</h2>
              <div style={{ marginTop: 12, display: "grid", gap: 8 }} aria-live="polite">
                {checks.map((c) => {
                  const [bg, dot, icon] = checkStyle[c.st];
                  return (
                    <div key={c.t} className="check" style={{ background: bg }}>
                      <span aria-hidden="true" className="check-dot" style={{ background: dot }}>{icon}</span>
                      <span><strong style={{ fontWeight: 700 }}>{c.t}</strong><span style={{ display: "block", color: "var(--ink2)" }}>{c.s}</span></span>
                    </div>
                  );
                })}
              </div>
              {missing.length > 0 && <p style={{ margin: "12px 0 0", fontSize: 12, color: "var(--mute)" }}>Still needed: {missing.map((k) => ALL_SLOTS.find(([s]) => s === k)[1]).join(", ")}.</p>}
            </div>
          </aside>
        </div>
      </div>

      {/* printable quotation (only shows when printing) */}
      <section className="print-only" aria-hidden="true">
        <div className="pq-head">
          <img src="/brand/newcom-logo.png" alt="" />
          <div>
            <strong>{site.legalName}</strong><br />{site.address}<br />{site.phone} · {site.email}
          </div>
        </div>
        <h1>PC build quotation</h1>
        <p>Platform: {platform === "amd" ? "AMD Ryzen" : "Intel"} · Estimated power draw: {watts}W · Prepared on the Newcom website</p>
        <table>
          <thead><tr><th>Component</th><th>Part</th><th style={{ textAlign: "right" }}>Price</th></tr></thead>
          <tbody>
            {chosen.map(([k, label]) => <tr key={k}><td>{label}</td><td>{sel[k].name}</td><td style={{ textAlign: "right" }}>{lkr(sel[k].price)}</td></tr>)}
          </tbody>
          <tfoot><tr><td colSpan={2}>Estimated total</td><td style={{ textAlign: "right" }}>{lkr(total)}</td></tr></tfoot>
        </table>
        <p>Compatibility: {bad ? `${bad} issue(s) to review with our team.` : "No issues found by the automatic checks."}</p>
        <p className="pq-small">Bring this quotation to our Colombo showroom for in-person assembly and pickup. Prices are estimates and are confirmed at the time of purchase.</p>
      </section>
    </>
  );
}

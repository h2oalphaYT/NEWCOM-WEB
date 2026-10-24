"use client";

import { useState } from "react";
import Link from "next/link";
import { site, whatsappLink } from "@/lib/site";

// Repair and customisation services with an enquiry form that opens WhatsApp with the details.
const services = [
  { k: "repair", t: "Hardware repairs", s: "Laptops and desktops that won't power on, overheat or crash.", d: "M14.7 6.3a4 4 0 0 1-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 1 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4z" },
  { k: "board", t: "Motherboard diagnostics", s: "Component-level testing for boards, power delivery and BIOS faults.", d: "M7 7h10v10H7zM10 10h4v4h-4zM9 3v4M15 3v4M9 17v4M15 17v4" },
  { k: "loop", t: "Custom liquid cooling", s: "Hard-tube and soft-tube loops designed and built for your case.", d: "M12 2s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11z" },
  { k: "thermal", t: "Thermal servicing", s: "Dust cleaning, thermal paste and pad replacement for cooler, quieter running.", d: "M14 14.8V4a2 2 0 0 0-4 0v10.8a4 4 0 1 0 4 0z" },
  { k: "upgrade", t: "Upgrades and assembly", s: "RAM, SSD and GPU upgrades, OS installs and full custom builds.", d: "M12 2v6M12 22v-6M4.9 4.9l4.2 4.2M14.9 14.9l4.2 4.2M2 12h6M22 12h-6" },
];

export default function Services() {
  const [svc, setSvc] = useState("repair");
  const [f, setF] = useState({ name: "", phone: "", device: "", date: "", note: "", branch: site.branches[0] });
  const [err, setErr] = useState("");
  const set = (k) => (e) => { setF({ ...f, [k]: e.target.value }); setErr(""); };

  function send(e) {
    e.preventDefault();
    if (!f.name.trim()) return setErr("Enter your name.");
    if (!/^(\+94|0)?7\d{8}$/.test(f.phone.replace(/[\s-]/g, ""))) return setErr("Enter a Sri Lankan mobile number.");
    if (!f.device.trim()) return setErr("Tell us which device or PC it is.");
    const s = services.find((x) => x.k === svc).t;
    const text = `Hi Newcom, I'd like to book: ${s}.\nDevice: ${f.device}\nPreferred date: ${f.date || "any"}\nBranch: ${f.branch}\nDetails: ${f.note || "-"}\nName: ${f.name}\nMobile: ${f.phone}`;
    window.open(whatsappLink(text), "_blank", "noopener,noreferrer");
  }

  return (
    <div className="wrap">
      <nav aria-label="Breadcrumb" className="crumbs"><Link href="/">Home</Link><span aria-hidden="true">/</span><strong>Repairs and services</strong></nav>
      <h1 className="page-title">Repairs and services</h1>
      <p className="lead">Book a repair, diagnostics or a custom cooling build. Our technicians confirm the time with you on WhatsApp.</p>

      <div className="cats" style={{ marginTop: 28 }}>
        {services.map((x) => (
          <button key={x.k} className={`cat cat-tile svc${svc === x.k ? " on" : ""}`} onClick={() => setSvc(x.k)} aria-pressed={svc === x.k}>
            <span className="ico-lg" style={{ width: 64, height: 64 }}><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={x.d} /></svg></span>
            <span style={{ textAlign: "left" }}><strong>{x.t}</strong><span>{x.s}</span></span>
          </button>
        ))}
      </div>

      <form className="card" onSubmit={send} noValidate style={{ marginTop: 28, padding: 24, maxWidth: 820 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>Book: {services.find((x) => x.k === svc).t}</h2>
        <div className="cform">
          <label className="fl">Full name<input className="in" value={f.name} onChange={set("name")} autoComplete="name" /></label>
          <label className="fl">Mobile number<input className="in" value={f.phone} onChange={set("phone")} inputMode="tel" autoComplete="tel" /></label>
          <label className="fl">Device or PC<input className="in" value={f.device} onChange={set("device")} placeholder="e.g. ASUS TUF A15, custom gaming PC" /></label>
          <label className="fl">Preferred date<input className="in" type="date" value={f.date} onChange={set("date")} /></label>
          <label className="fl">Branch<select className="in" value={f.branch} onChange={set("branch")}>{site.branches.map((b) => <option key={b}>{b}</option>)}</select></label>
          <label className="fl" style={{ gridColumn: "1 / -1" }}>Details<textarea className="in ta" rows={3} value={f.note} onChange={set("note")} /></label>
        </div>
        <div role="alert" className="err" style={{ minHeight: 18 }}>{err}</div>
        <button type="submit" className="btn btn-primary" style={{ marginTop: 6 }}>Send booking on WhatsApp</button>
      </form>
    </div>
  );
}

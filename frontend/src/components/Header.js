"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { menus, linkFor } from "@/lib/menu";
import { site } from "@/lib/site";

export default function Header() {
  const router = useRouter();
  const [ann, setAnn] = useState(true);
  const [open, setOpen] = useState(-1);
  const [q, setQ] = useState("");
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    setTheme(document.documentElement.getAttribute("data-theme") || "light");
    const onStore = (e) => {
      if (e.key === "newcom-theme" && (e.newValue === "dark" || e.newValue === "light")) applyTheme(e.newValue);
    };
    window.addEventListener("storage", onStore);
    return () => window.removeEventListener("storage", onStore);
  }, []);

  function applyTheme(t) {
    document.documentElement.setAttribute("data-theme", t);
    setTheme(t);
  }

  function toggleTheme() {
    const t = theme === "dark" ? "light" : "dark";
    try { localStorage.setItem("newcom-theme", t); } catch {}
    applyTheme(t);
  }

  function onSearch(e) {
    e.preventDefault();
    if (q.trim()) router.push(`/products?q=${encodeURIComponent(q.trim())}`);
  }

  const cur = open >= 0 ? menus[open] : null;
  const isDark = theme === "dark";

  return (
    <header className={`hdr${ann ? " has-ann" : ""}`} onMouseLeave={() => setOpen(-1)}>
      {ann && (
        <div className="ann">
          <span>Island-wide delivery · Manufacturer warranty on all products</span>
          <button onClick={() => setAnn(false)} aria-label="Dismiss announcement">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>
      )}
      <div className="hdr-bar">
        <div className="hdr-top">
          <Link href="/" className="logo" aria-label="Newcom home">
            <img className="light" src="/brand/newcom-logo.png" alt={`Newcom: ${site.tagline}`} />
            <img className="dark" src="/brand/newcom-logo-dark.png" alt="" aria-hidden="true" />
          </Link>
          <form className="search" role="search" onSubmit={onSearch}>
            <label htmlFor="hq" className="sr-only">Search products</label>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
            <input id="hq" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by product, brand, model or SKU" autoComplete="off" />
          </form>
          <div className="hdr-actions">
            <button className="ib" onClick={toggleTheme} aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"} title={isDark ? "Switch to light theme" : "Switch to dark theme"}>
              {isDark ? (
                <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
              ) : (
                <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>
              )}
            </button>
            <a className="call" href={site.phoneHref}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" /></svg>
              {site.phone}
            </a>
          </div>
        </div>
        <nav className="hn" aria-label="Categories">
          {menus.map((m, i) => (
            <button key={m.label} className="nv" onMouseEnter={() => setOpen(i)} onClick={() => setOpen(open === i ? -1 : i)} onKeyDown={(e) => e.key === "Escape" && setOpen(-1)} aria-expanded={open === i}>
              {m.label}
            </button>
          ))}
          <Link href="/pc-builder" className="nv accent">Build your PC</Link>
          <Link href="/contact" className="nv muted">Contact</Link>
        </nav>
      </div>
      {cur && (
        <div className="megapanel">
          <div className="megapanel-in">
            {cur.cols.map((c) => (
              <div key={c.title}>
                <h4>{c.title}</h4>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {c.links.map((l) => (
                    <Link key={l} href={linkFor(l)} className="hit" onClick={() => setOpen(-1)}>{l}</Link>
                  ))}
                </div>
              </div>
            ))}
            <Link href={linkFor(cur.label)} className="mega-all" onClick={() => setOpen(-1)}>Shop all {cur.label} →</Link>
          </div>
        </div>
      )}
    </header>
  );
}

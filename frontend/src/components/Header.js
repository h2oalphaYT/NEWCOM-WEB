"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCart } from "@/components/CartProvider";
import { icons, productHref, products } from "@/lib/catalog";
import MenuThumb from "@/components/MenuThumb";
import { heroFor, menus, linkFor } from "@/lib/menu";
import { lkr, site } from "@/lib/site";
import { api } from "@/lib/apiClient";

const kindIcon = { gpu: icons.gpu, cpu: icons.cpu, laptop: icons.lap, monitor: icons.mon };

export default function Header() {
  const router = useRouter();
  const { count } = useCart();
  const [ann, setAnn] = useState(true);
  const [annText, setAnnText] = useState("Island-wide delivery · Manufacturer warranty on all products");
  const [open, setOpen] = useState(-1);
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(-1);
  const [theme, setTheme] = useState("light");
  const [bump, setBump] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [acc, setAcc] = useState(-1);
  const prevCount = useRef(count);
  const hdrRef = useRef(null);
  const path = usePathname();

  // close the mobile menu on navigation, lock page scroll while it is open
  useEffect(() => { setDrawer(false); setOpen(-1); }, [path]);
  // announcement text is edited in /admin → Settings (key "announcement"; empty hides the bar)
  useEffect(() => { api("GET", "/api/web/settings").then((r) => { if (r.ok && r.payload && "announcement" in r.payload) setAnnText(r.payload.announcement.trim()); }); }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("no-scroll", drawer);
    if (!drawer) return;
    const onEsc = (e) => e.key === "Escape" && setDrawer(false);
    addEventListener("keydown", onEsc);
    return () => removeEventListener("keydown", onEsc);
  }, [drawer]);

  // expose the header height so sticky elements (e.g. the builder's 3D view) sit below it
  useEffect(() => {
    const el = hdrRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const set = () => document.documentElement.style.setProperty("--hdr-h", `${el.querySelector(".hdr-bar")?.offsetHeight || 0}px`);
    const ro = new ResizeObserver(set);
    ro.observe(el);
    set();
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (count > prevCount.current) {
      setBump(true);
      const t = setTimeout(() => setBump(false), 450);
      prevCount.current = count;
      return () => clearTimeout(t);
    }
    prevCount.current = count;
  }, [count]);

  const term = q.trim().toLowerCase();
  const hits = term ? products.filter((p) => `${p.name} ${p.brand} ${p.id}`.toLowerCase().includes(term)).slice(0, 5) : [];

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

  function go(href) {
    setQ("");
    setSel(-1);
    router.push(href);
  }

  function onSearch(e) {
    e.preventDefault();
    if (sel >= 0 && hits[sel]) go(productHref(hits[sel].id));
    else if (q.trim()) go(`/products?q=${encodeURIComponent(q.trim())}`);
  }

  function onKey(e) {
    const n = hits.length;
    if (e.key === "ArrowDown" && n) { e.preventDefault(); setSel((sel + 1) % n); }
    else if (e.key === "ArrowUp" && n) { e.preventDefault(); setSel((sel - 1 + n) % n); }
    else if (e.key === "Escape") { setQ(""); setSel(-1); }
  }

  const cur = open >= 0 ? menus[open] : null;
  const isDark = theme === "dark";

  return (
    <header ref={hdrRef} className={`hdr${ann && annText ? " has-ann" : ""}`} onMouseLeave={() => setOpen(-1)}>
      {ann && annText && (
        <div className="ann">
          <span>{annText}</span>
          <button onClick={() => setAnn(false)} aria-label="Dismiss announcement">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>
      )}
      <div className="hdr-bar">
        <div className="hdr-top">
          <button className="ib mb-only" onClick={() => setDrawer(true)} aria-label="Open menu" aria-expanded={drawer} aria-controls="mnav">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <Link href="/" className="logo" aria-label="Newcom home">
            <img className="light" src="/brand/newcom-logo.png" alt={`Newcom: ${site.tagline}`} />
            <img className="dark" src="/brand/newcom-logo-dark.png" alt="" aria-hidden="true" />
          </Link>
          <form className="search" role="search" onSubmit={onSearch}>
            <label htmlFor="hq" className="sr-only">Search products</label>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
            <input id="hq" value={q} onChange={(e) => { setQ(e.target.value); setSel(-1); }} onKeyDown={onKey} placeholder="Search by product, brand, model or SKU" autoComplete="off" role="combobox" aria-expanded={!!term} aria-controls="hres" />
            {term && (
              <div id="hres" role="listbox" className="hres">
                {hits.length === 0 ? (
                  <div className="hres-empty">No products match “{q.trim()}”. Try a model number or brand.</div>
                ) : (
                  <>
                    {hits.map((h, i) => (
                      <a key={h.id} href={productHref(h.id)} role="option" aria-selected={i === sel} className="hit hres-row" style={{ background: i === sel ? "var(--surface)" : undefined }} onClick={(e) => { e.preventDefault(); go(productHref(h.id)); }}>
                        <span className="hres-ico"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={kindIcon[h.kind] || icons.ssd} /></svg></span>
                        <span style={{ minWidth: 0, flex: 1 }}><span className="hres-name">{h.name}</span><span className="hres-meta">{h.brand} · {h.id}</span></span>
                        <span style={{ fontSize: 14, fontWeight: 700, whiteSpace: "nowrap" }}>{lkr(h.price)}</span>
                      </a>
                    ))}
                    <a href={`/products?q=${encodeURIComponent(q.trim())}`} className="hres-all" onClick={(e) => { e.preventDefault(); go(`/products?q=${encodeURIComponent(q.trim())}`); }}>See all results for “{q.trim()}”</a>
                  </>
                )}
              </div>
            )}
          </form>
          <div className="hdr-actions">
            <button className="ib" onClick={toggleTheme} aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"} title={isDark ? "Switch to light theme" : "Switch to dark theme"}>
              {isDark ? (
                <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
              ) : (
                <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>
              )}
            </button>
            <a className="ib dt-only" href={site.phoneHref} aria-label={`Call ${site.phone}`} title={`Call ${site.phone}`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" /></svg>
            </a>
            <Link className="ib" href="/account" aria-label="My account" title="My account">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>
            </Link>
            <Link href="/cart" className="call" aria-label={`Cart, ${count} items`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" /></svg>
              <span className="dt-only">Cart</span> <span className={`cartn${bump ? " bump" : ""}`}>{count}</span>
            </Link>
          </div>
        </div>
        <nav className="hn" aria-label="Categories">
          {menus.map((m, i) => (
            <button key={m.label} className="nv" onMouseEnter={() => setOpen(i)} onClick={() => setOpen(open === i ? -1 : i)} onKeyDown={(e) => e.key === "Escape" && setOpen(-1)} aria-expanded={open === i}>
              {m.label}
            </button>
          ))}
          <Link href="/pre-owned" className="nv">Pre-owned</Link>
          <Link href="/pc-builder" className="nv accent">Build your PC</Link>
          <Link href="/services" className="nv muted">Repairs</Link>
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
                    <Link key={l} href={linkFor(l)} className="hit mlink" onClick={() => setOpen(-1)}><MenuThumb label={l} />{l}</Link>
                  ))}
                </div>
              </div>
            ))}
            <Link href={linkFor(cur.label)} className="mega-all" onClick={() => setOpen(-1)}>
              {heroFor(cur.label) && <img src={heroFor(cur.label)} alt="" />}
              <span>Shop all {cur.label} →</span>
            </Link>
          </div>
        </div>
      )}
      {drawer && createPortal(
        <div className="mnav-wrap" onClick={() => setDrawer(false)}>
          <nav id="mnav" className="mnav" aria-label="Menu" onClick={(e) => e.stopPropagation()}>
            <div className="mnav-head">
              <img className="mnav-logo" src={isDark ? "/brand/newcom-logo-dark.png" : "/brand/newcom-logo.png"} alt="Newcom" />
              <button className="ib" onClick={() => setDrawer(false)} aria-label="Close menu">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="mnav-quick">
              <Link href="/pc-builder" className="mq-build">Build your PC</Link>
              <Link href="/pre-owned">Pre-owned</Link>
              <Link href="/compare">Compare</Link>
            </div>
            <div className="mnav-sec">Shop by category</div>
            {menus.map((m, i) => (
              <div key={m.label} className="mnav-acc">
                <button onClick={() => setAcc(acc === i ? -1 : i)} aria-expanded={acc === i}>
                  <span className="mnav-lbl"><MenuThumb label={m.label} />{m.label}</span><span aria-hidden="true">{acc === i ? "−" : "+"}</span>
                </button>
                {acc === i && (
                  <div className="mnav-links">
                    <Link href={linkFor(m.label)}>Shop all {m.label}</Link>
                    {m.cols.flatMap((c) => c.links).map((l) => <Link key={l} href={linkFor(l)}><MenuThumb label={l} />{l}</Link>)}
                  </div>
                )}
              </div>
            ))}
            <div className="mnav-sec">Help</div>
            <Link className="mnav-row" href="/account">My account and orders</Link>
            <Link className="mnav-row" href="/services">Repairs and services</Link>
            <Link className="mnav-row" href="/support/warranty">Warranty claims</Link>
            <Link className="mnav-row" href="/contact">Contact and directions</Link>
            <div className="mnav-call">
              <a className="btn" href={site.phoneHref}>Call {site.phone}</a>
              <a className="btn btn-primary" href={`https://wa.me/${site.whatsappNumber}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>
            </div>
          </nav>
        </div>,
        document.body
      )}
    </header>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import ProductArt from "@/components/ProductArt";
import ProductCard from "@/components/ProductCard";
import { useCart } from "@/components/CartProvider";
import { useCompare } from "@/components/CompareProvider";
import { brandAccent, categoryHref, koko, mintpay, products, stockInfo } from "@/lib/catalog";
import { lkr, site } from "@/lib/site";

const info = [
  { t: "Warranty", s: "[Warranty period and terms from the catalogue]", d: "M12 2 4 5v6c0 5 3.4 9 8 11 4.6-2 8-6 8-11V5z" },
  { t: "Delivery or collection", s: "[Delivery estimate calculated from address; collection location if supported]", d: "M1 3h15v13H1zM16 8h4l3 3v5h-7zM5.5 19a1.5 1.5 0 1 0 .01 0M18.5 19a1.5 1.5 0 1 0 .01 0" },
  { t: "Compatible with", s: "Check this part against your build in the PC builder.", d: "M5 12l5 5L20 7" },
];

const gpuSpecs = (p) => [
  { t: "Graphics engine", rows: [{ k: "GPU", v: p.chip }, { k: "Boost clock", v: "[from data feed]" }] },
  { t: "Memory", rows: [{ k: "Capacity", v: p.vram }, { k: "Type", v: "[from data feed]" }] },
  { t: "Physical and power", rows: [{ k: "Length", v: "[from data feed] mm" }, { k: "Recommended PSU", v: "[from data feed]" }] },
  { t: "Outputs", rows: [{ k: "HDMI / DisplayPort", v: "[from data feed]" }] },
];

export default function ProductDetail({ p }) {
  const cart = useCart();
  const [img, setImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [flash, setFlash] = useState(false);
  const [wish, setWish] = useState(false);
  const compare = useCompare();
  const cmp = compare.has(p.id);
  const [tab, setTab] = useState("spec");
  const [lb, setLb] = useState(false);

  const accent = brandAccent[p.brand] || "#E31E24";
  const [stockLabel, stockColor] = stockInfo[p.stock] || stockInfo.in;
  const noBuy = p.stock === "out";
  const specGroups = p.chip ? gpuSpecs(p) : [{ t: "Overview", rows: [{ k: "Brand", v: p.brand }, { k: "Category", v: p.category }, { k: "SKU", v: p.id }, ...p.specs] }];
  const related = products.filter((x) => x.id !== p.id && x.category === p.category).slice(0, 4);
  const relatedFill = related.length < 4 ? [...related, ...products.filter((x) => x.id !== p.id && !related.includes(x)).slice(0, 4 - related.length)] : related;

  function addCart() {
    if (noBuy) return;
    cart.add(p.id, qty);
    setFlash(true);
    setTimeout(() => setFlash(false), 1400);
  }

  return (
    <>
      <div className="wrap" style={{ paddingTop: 20, paddingBottom: 0 }}>
        <nav aria-label="Breadcrumb" className="crumbs">
          <Link href="/">Home</Link><span aria-hidden="true">/</span>
          <Link href={categoryHref(p.category)}>{p.category}</Link><span aria-hidden="true">/</span>
          <strong>{p.name}</strong>
        </nav>
      </div>

      <div className="wrap pd">
        <div style={{ flex: "1 1 520px", minWidth: 0 }}>
          <button className="pd-main" onClick={() => setLb(true)} aria-label="Open image in full view">
            <span><ProductArt kind={p.kind} accent={accent} /></span>
          </button>
          <div className="pd-thumbs">
            {[0, 1, 2, 3].map((i) => (
              <button key={i} className="th" onClick={() => setImg(i)} aria-label={`Show image ${i + 1}`} aria-pressed={img === i} style={{ borderColor: img === i ? "#E31E24" : "var(--line)" }}>
                <ProductArt kind={p.kind} accent={accent} />
              </button>
            ))}
          </div>
        </div>

        <div className="pd-info">
          <div className="slot-label" style={{ fontSize: 13 }}>{p.brand} · SKU {p.id}</div>
          <h1 className="pd-title">{p.name}</h1>
          <div className="pd-stock" style={{ color: stockColor }}><span style={{ background: stockColor }} />{stockLabel} <span style={{ color: "var(--mute)", fontWeight: 400 }}>(sample status)</span></div>
          {p.was && <div style={{ marginTop: 16, fontSize: 14, color: "var(--mute)", textDecoration: "line-through" }}>{lkr(p.was)}</div>}
          <div className="pd-price">{lkr(p.price)}</div>
          <div style={{ marginTop: 4, fontSize: 13, color: "var(--mute)" }}>Sample price. Taxes and delivery fees are shown at checkout once calculated.</div>
          <div className="bnpl">
            <div><span className="koko">KOKO</span> Pay in 3 × <strong>{lkr(koko(p.price))}</strong> with your debit or credit card</div>
            <div><span className="mintpay">mintpay</span> Split into 3 × <strong>{lkr(mintpay(p.price))}</strong>, interest-free</div>
          </div>
          {p.condition === "used" && (
            <div className="used-box"><strong>Certified pre-owned · Grade {p.grade}</strong>Tested by our technicians and covered by a {p.usedWarranty} Newcom warranty.</div>
          )}
          <div className="branch-stock">
            {site.branches.map((b) => {
              const n = p.branchStock?.[b] || 0;
              return <div key={b}><span style={{ background: n ? "#15803D" : "#94A3B8" }} />{b}: {n ? `${n} in stock (sample)` : "check availability"}</div>;
            })}
          </div>

          <div style={{ marginTop: 24, display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
            <div role="group" aria-label="Quantity" className="qty">
              <button onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Decrease quantity">−</button>
              <span aria-live="polite">{qty}</span>
              <button onClick={() => (qty >= p.max ? cart.notify(`Maximum of ${p.max} reached for this item.`) : setQty(qty + 1))} aria-label="Increase quantity">+</button>
            </div>
            <button className="btn btn-primary" onClick={addCart} disabled={noBuy} style={{ flex: "1 1 180px", height: 50, background: noBuy ? "#94A3B8" : flash ? "#15803D" : undefined }}>
              {noBuy ? "Out of stock" : flash ? "Added ✓" : "Add to cart"}
            </button>
          </div>
          <div style={{ fontSize: 12, color: "var(--mute)", marginTop: 8 }}>Limit {p.max} per order based on sample stock.</div>
          <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 10 }}>
            <Link href="/cart" className="btn" onClick={() => !noBuy && cart.add(p.id, qty)} style={{ flex: "1 1 140px", borderColor: "var(--ink)" }}>Buy now</Link>
            <button className="btn" onClick={() => setWish(!wish)} aria-pressed={wish} style={{ flex: "1 1 140px", background: wish ? "var(--badbg)" : undefined }}>{wish ? "Saved" : "Wishlist"}</button>
            <button className="btn" onClick={() => compare.toggle(p.id)} aria-pressed={cmp} style={{ flex: "1 1 140px", background: cmp ? "var(--tint)" : undefined }}>{cmp ? "Comparing" : "Compare"}</button>
          </div>

          <div className="pd-perks">
            {info.map((i) => (
              <div key={i.t}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E31E24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={i.d} /></svg>
                <div><strong>{i.t}</strong><span>{i.s}</span></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className="sec" style={{ paddingTop: 72 }}>
        <div role="tablist" aria-label="Product information" className="tabs">
          {[["spec", "Specifications"], ["desc", "Description"], ["rev", "Reviews"]].map(([k, label]) => (
            <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)}>{label}</button>
          ))}
        </div>
        <div key={tab} className="tabpane">
          {tab === "spec" && (
            <div className="specs">
              {specGroups.map((g) => (
                <div key={g.t}>
                  <h3>{g.t}</h3>
                  <dl>{g.rows.map((r) => <div key={r.k}><dt>{r.k}</dt><dd>{r.v}</dd></div>)}</dl>
                </div>
              ))}
            </div>
          )}
          {tab === "desc" && (
            <div style={{ maxWidth: 720, fontSize: 16, lineHeight: 1.75, color: "var(--ink2)" }}>
              <p style={{ marginTop: 0 }}>[Description supplied by manufacturer data feed or Newcom.]</p>
              <p style={{ fontSize: 13, color: "var(--mute)", marginTop: 24 }}>Sample copy for layout only. Specifications must come from verified product data.</p>
            </div>
          )}
          {tab === "rev" && (
            <div className="empty" style={{ maxWidth: 640 }}><strong>No verified reviews for this product yet</strong><p>Reviews appear here once a review source is connected. Nothing is invented.</p></div>
          )}
        </div>
      </section>

      <section className="sec" style={{ paddingBottom: 96 }}>
        <h2 className="h2" style={{ fontSize: 30 }}>Related products</h2>
        <div className="pgrid" style={{ marginTop: 24 }}>{relatedFill.map((r) => <ProductCard key={r.id} p={r} />)}</div>
      </section>

      <div className="pd-buybar no-print">
        <div><strong>{lkr(p.price)}</strong><span>or 3 × {lkr(koko(p.price))} with KOKO</span></div>
        <button className="btn btn-primary" onClick={addCart} disabled={noBuy} style={{ background: noBuy ? "#94A3B8" : flash ? "#15803D" : undefined }}>{noBuy ? "Out of stock" : flash ? "Added ✓" : "Add to cart"}</button>
      </div>

      {lb && (
        <div role="dialog" aria-modal="true" aria-label="Product image" className="lb" onClick={() => setLb(false)}>
          <button onClick={() => setLb(false)} aria-label="Close">×</button>
          <div onClick={(e) => e.stopPropagation()}><ProductArt kind={p.kind} accent={accent} /></div>
        </div>
      )}
    </>
  );
}

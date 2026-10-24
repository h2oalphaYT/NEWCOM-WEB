"use client";

import { useState } from "react";
import Link from "next/link";
import ProductArt from "@/components/ProductArt";
import { useCart } from "@/components/CartProvider";
import { brandAccent, productHref, stockInfo } from "@/lib/catalog";
import { lkr } from "@/lib/site";

export default function ProductCard({ p }) {
  const cart = useCart();
  const [wish, setWish] = useState(false);
  const [pop, setPop] = useState(false);
  const [cmp, setCmp] = useState(false);
  const [qv, setQv] = useState(false);
  const [flash, setFlash] = useState(false);

  const noBuy = p.stock === "out";
  const request = p.stock === "request";
  const [stockLabel, stockColor] = stockInfo[p.stock] || stockInfo.in;
  const href = productHref(p.id);

  function add() {
    if (noBuy) return;
    if (!request) cart.add(p.id);
    setFlash(true);
    setTimeout(() => setFlash(false), request ? 1600 : 1200);
  }

  return (
    <article className="pc">
      <div className="pc-media">
        <div className="ph">
          {p.img ? <img src={p.img} alt={p.name} loading="lazy" /> : <ProductArt kind={p.kind} accent={p.accent || brandAccent[p.brand] || "#E31E24"} />}
        </div>
        {p.badge && <span className="pc-badge" style={{ background: p.badge === "Sale" ? "#181818" : "#E31E24" }}>{p.badge}</span>}
        <button className="pc-wish" onClick={() => { setWish(!wish); setPop(true); setTimeout(() => setPop(false), 420); }} aria-pressed={wish} aria-label="Add to wishlist">
          <span className={pop ? "pop" : ""} style={{ color: wish ? "#DC2626" : "var(--mute)" }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill={wish ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7z" /></svg>
          </span>
        </button>
        <div className="act">
          <button onClick={() => setQv(!qv)}>Quick view</button>
          <button onClick={() => setCmp(!cmp)} aria-pressed={cmp} style={cmp ? { borderColor: "#E31E24", background: "var(--tint)" } : undefined}>{cmp ? "Comparing" : "Compare"}</button>
        </div>
        {qv && (
          <div className="qv">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <strong style={{ fontSize: 13 }}>Key specs</strong>
              <button onClick={() => setQv(false)} aria-label="Close quick view" className="qv-x">×</button>
            </div>
            {p.specs.map((sp) => (
              <div key={sp.k} className="qv-row"><span style={{ color: "var(--mute)" }}>{sp.k}</span><span style={{ fontWeight: 600, textAlign: "right" }}>{sp.v}</span></div>
            ))}
            <Link href={href} style={{ display: "inline-block", marginTop: 8, color: "var(--link)", fontWeight: 600 }}>Full details →</Link>
          </div>
        )}
      </div>
      <div className="pc-body">
        <span className="pc-brand">{p.brand}</span>
        <Link href={href} className="pc-name">{p.name}</Link>
        <div className="pc-stock" style={{ color: stockColor }}><span style={{ background: stockColor }} />{stockLabel}</div>
        <div style={{ marginTop: "auto", paddingTop: 10 }}>
          {p.was && <div style={{ fontSize: 12, color: "var(--mute)", textDecoration: "line-through" }}>{lkr(p.was)}</div>}
          <div className="pc-buy">
            <span className="pc-price">{lkr(p.price)}</span>
            <button className="add" onClick={add} disabled={noBuy} style={{ background: noBuy ? "#94A3B8" : flash ? "#15803D" : "#E31E24", cursor: noBuy ? "not-allowed" : "pointer" }}>
              {noBuy ? "Unavailable" : request ? (flash ? "Sent (demo)" : "Enquire") : flash ? "Added ✓" : "Add to cart"}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

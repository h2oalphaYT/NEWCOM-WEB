"use client";

import Link from "next/link";
import ProductImage from "@/components/ProductImage";
import { useCart } from "@/components/CartProvider";
import { useCompare } from "@/components/CompareProvider";
import { brandAccent, compareRows, productHref } from "@/lib/catalog";
import { lkr } from "@/lib/site";

export default function ComparePage() {
  const { items, toggle, clear } = useCompare();
  const cart = useCart();
  const rows = compareRows(items);

  // highlight the best value in rows where "best" is obvious
  const best = (label, vals) => {
    if (label === "Price") { const m = Math.min(...vals.filter(Boolean)); return vals.map((v) => v === m); }
    if (label === "Refresh rate") { const n = vals.map((v) => parseInt(v, 10) || 0); const m = Math.max(...n); return n.map((v) => m > 0 && v === m); }
    return vals.map(() => false);
  };

  return (
    <div className="wrap">
      <nav aria-label="Breadcrumb" className="crumbs"><Link href="/">Home</Link><span aria-hidden="true">/</span><strong>Compare</strong></nav>
      <div className="cat-head">
        <h1 className="page-title" style={{ marginTop: 0 }}>Compare products</h1>
        {items.length > 0 && <button className="btn" onClick={clear}>Clear all</button>}
      </div>

      {items.length < 2 ? (
        <div className="empty" style={{ marginTop: 24 }}>
          <strong>Add at least two products to compare</strong>
          <p>Use the Compare button on any product card or product page. You can compare up to four.</p>
          <Link className="btn btn-primary" href="/products?category=Laptops">Browse laptops</Link>
        </div>
      ) : (
        <div className="cmp-scroll">
          <table className="cmp-table">
            <thead>
              <tr>
                <th scope="col"><span className="sr-only">Spec</span></th>
                {items.map((p) => (
                  <th key={p.id} scope="col">
                    <div className="cmp-art"><ProductImage p={p} /></div>
                    <Link href={productHref(p.id)} className="cmp-name">{p.name}</Link>
                    <div className="cmp-actions">
                      <button className="btn btn-primary" disabled={p.stock === "out"} onClick={() => cart.add(p)}>Add to cart</button>
                      <button className="btn" onClick={() => toggle(p)}>Remove</button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(([label, vals]) => {
                const b = best(label, vals);
                const differs = new Set(vals.map(String)).size > 1;
                return (
                  <tr key={label} className={differs ? "diff" : ""}>
                    <th scope="row">{label}</th>
                    {vals.map((v, i) => (
                      <td key={i} className={b[i] ? "best" : ""}>{v === undefined || v === null || v === "" ? "–" : label === "Price" ? lkr(v) : String(v)}</td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p style={{ fontSize: 12, color: "var(--mute)", marginTop: 12 }}>Rows that differ are highlighted. Best price and highest refresh rate are marked in green. Sample data.</p>
        </div>
      )}
    </div>
  );
}

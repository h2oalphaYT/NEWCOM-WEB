"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { products } from "@/lib/catalog";
import { lkr } from "@/lib/site";

const MAX = 400000;
const PER_PAGE = 6;

// Category and filters page from the redesign mockup, generalised to the whole sample catalogue.
export default function CategoryView({ category = "", q = "" }) {
  const base = useMemo(() => {
    const n = q.trim().toLowerCase();
    return products.filter((p) =>
      (!category || p.category === category) &&
      (!n || `${p.name} ${p.brand} ${p.id} ${p.category}`.toLowerCase().includes(n)));
  }, [category, q]);

  const [brands, setBrands] = useState([]);
  const [chips, setChips] = useState([]);
  const [stock, setStock] = useState(false);
  const [max, setMax] = useState(MAX);
  const [sort, setSort] = useState("pop");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [drawer, setDrawer] = useState(false);
  const tt = useRef(0);

  // short skeleton flash on every filter change, as in the mockup
  function refresh(fn) {
    fn();
    setPage(1);
    setLoading(true);
    const t = ++tt.current;
    setTimeout(() => { if (t === tt.current) setLoading(false); }, 260);
  }
  const toggle = (set, val) => refresh(() => set((cur) => (cur.includes(val) ? cur.filter((x) => x !== val) : [...cur, val])));
  const clearAll = () => refresh(() => { setBrands([]); setChips([]); setStock(false); setMax(MAX); });

  useEffect(() => { setBrands([]); setChips([]); setStock(false); setMax(MAX); setPage(1); }, [category, q]);

  let list = base.filter((p) =>
    (!brands.length || brands.includes(p.brand)) &&
    (!chips.length || chips.includes(p.chip || p.category)) &&
    (!stock || p.stock === "in") &&
    p.price <= max);
  if (sort === "lo") list = [...list].sort((a, b) => a.price - b.price);
  if (sort === "hi") list = [...list].sort((a, b) => b.price - a.price);

  const uniq = (fn) => [...new Set(base.map(fn))];
  const count = (fn, v) => base.filter((p) => fn(p) === v).length;
  const subKey = (p) => p.chip || p.category;
  const isGpu = category === "Graphics cards";
  const groups = [
    { title: "Brand", opts: uniq((p) => p.brand).map((v) => ({ label: v, n: count((p) => p.brand, v), on: brands.includes(v), toggle: () => toggle(setBrands, v) })) },
    { title: isGpu ? "GPU chipset" : "Type", opts: uniq(subKey).map((v) => ({ label: v, n: count(subKey, v), on: chips.includes(v), toggle: () => toggle(setChips, v) })) },
    { title: "Availability", opts: [{ label: "In stock only", n: base.filter((p) => p.stock === "in").length, on: stock, toggle: () => refresh(() => setStock(!stock)) }] },
  ];
  const activeChips = [
    ...brands.map((v) => ({ label: v, remove: () => toggle(setBrands, v) })),
    ...chips.map((v) => ({ label: v, remove: () => toggle(setChips, v) })),
    ...(stock ? [{ label: "In stock", remove: () => refresh(() => setStock(false)) }] : []),
    ...(max < MAX ? [{ label: `Up to ${lkr(max)}`, remove: () => refresh(() => setMax(MAX)) }] : []),
  ];
  const shown = list.slice(0, PER_PAGE * page);
  const title = category || (q ? `Results for “${q}”` : "All products");

  return (
    <>
      <div className="wrap" style={{ paddingBottom: 0, paddingTop: 20 }}>
        <nav aria-label="Breadcrumb" className="crumbs">
          <Link href="/">Home</Link><span aria-hidden="true">/</span>
          {category ? <><Link href="/products">Products</Link><span aria-hidden="true">/</span></> : null}
          <strong>{category || "Products"}</strong>
        </nav>
        <div className="cat-head">
          <div>
            <h1 className="page-title" style={{ marginTop: 0 }}>{title}</h1>
            <p className="lead">{isGpu ? "NVIDIA and AMD graphics cards. Filter by chipset, memory and price." : "Filter by brand, type, availability and price."} Sample data for demonstration.</p>
          </div>
          <div className="cat-tools">
            <button className="fb btn" onClick={() => setDrawer(true)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 5h18M6 12h12M10 19h4" /></svg>Filters
            </button>
            <span style={{ fontSize: 14, color: "var(--mute)" }} aria-live="polite">{list.length} {list.length === 1 ? "product" : "products"}</span>
            <label htmlFor="sort" className="sr-only">Sort by</label>
            <select id="sort" className="sel" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="pop">Sort: Featured</option><option value="lo">Price: low to high</option><option value="hi">Price: high to low</option>
            </select>
          </div>
        </div>
      </div>

      <div className="wrap cat-body">
        <aside className={`fside${drawer ? "" : " shut"}`} aria-label="Filters">
          <div className="fx fx-head"><strong style={{ fontSize: 18 }}>Filters</strong><button onClick={() => setDrawer(false)} aria-label="Close filters">×</button></div>
          {groups.map((g) => (
            <fieldset key={g.title} className="fgroup">
              <legend>{g.title}</legend>
              <div style={{ clear: "both" }}>
                {g.opts.map((o) => (
                  <label key={o.label} className="fopt"><input type="checkbox" checked={o.on} onChange={o.toggle} /><span style={{ flex: 1 }}>{o.label}</span><span style={{ fontSize: 12, color: "var(--mute)" }}>{o.n}</span></label>
                ))}
              </div>
            </fieldset>
          ))}
          <fieldset className="fgroup">
            <legend>Max price</legend>
            <div style={{ clear: "both" }}>
              <input type="range" min="20000" max={MAX} step="5000" value={max} onChange={(e) => refresh(() => setMax(Number(e.target.value)))} aria-label="Maximum price in LKR" style={{ width: "100%", accentColor: "#E31E24" }} />
              <div style={{ fontSize: 14, fontWeight: 600 }}>Up to {lkr(max)}</div>
            </div>
          </fieldset>
          <div className="fx" style={{ marginTop: 12 }}><button className="btn btn-primary" style={{ width: "100%" }} onClick={() => setDrawer(false)}>Show {list.length} results</button></div>
        </aside>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="chiprow">
            {activeChips.map((c) => (
              <button key={c.label} className="fchip" onClick={c.remove} aria-label={`Remove filter ${c.label}`}>{c.label}<span>×</span></button>
            ))}
            {activeChips.length > 0 && <button className="clear" onClick={clearAll}>Clear all</button>}
          </div>

          {loading ? (
            <div className="pgrid sm">{[1, 2, 3, 4, 5, 6].map((k) => <div key={k} className="sk" style={{ height: 400, borderRadius: 12, background: "var(--surface2)" }} />)}</div>
          ) : list.length === 0 ? (
            <div className="empty">
              <strong style={{ fontSize: 18 }}>No products match these filters</strong>
              <p>Try removing a filter or raising the maximum price.</p>
              <button className="btn btn-primary" onClick={clearAll}>Clear all filters</button>
            </div>
          ) : (
            <>
              <div className="pgrid sm fade">{shown.map((p) => <ProductCard key={p.id} p={p} />)}</div>
              {shown.length < list.length && (
                <div style={{ marginTop: 32, textAlign: "center" }}><button className="btn" onClick={() => setPage(page + 1)}>Load more ({list.length - shown.length} left)</button></div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

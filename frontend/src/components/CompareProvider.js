"use client";

import { createContext, useContext, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { findProduct } from "@/lib/catalog";

// Side-by-side comparison list (up to 4 items, kept in this browser) with a floating tray.
const CompareContext = createContext(null);
const KEY = "newcom-compare";
const MAX = 4;

export function CompareProvider({ children }) {
  const [ids, setIds] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [msg, setMsg] = useState("");
  const path = usePathname();

  useEffect(() => {
    try { const s = JSON.parse(localStorage.getItem(KEY) || "[]"); if (Array.isArray(s)) setIds(s.filter(findProduct)); } catch {}
    setLoaded(true);
  }, []);
  useEffect(() => { if (loaded) try { localStorage.setItem(KEY, JSON.stringify(ids)); } catch {} }, [ids, loaded]);

  function toggle(id) {
    setIds((cur) => {
      if (cur.includes(id)) return cur.filter((x) => x !== id);
      if (cur.length >= MAX) { setMsg(`You can compare up to ${MAX} items.`); setTimeout(() => setMsg(""), 2500); return cur; }
      return [...cur, id];
    });
  }
  const has = (id) => ids.includes(id);
  const clear = () => setIds([]);
  const items = ids.map(findProduct).filter(Boolean);

  return (
    <CompareContext.Provider value={{ ids, items, toggle, has, clear }}>
      {children}
      {items.length > 0 && path !== "/compare" && (
        <div className="cmp-tray no-print" role="region" aria-label="Compare list">
          <div className="cmp-items">
            {items.map((p) => (
              <span key={p.id} className="cmp-chip">{p.name}<button onClick={() => toggle(p.id)} aria-label={`Remove ${p.name} from compare`}>×</button></span>
            ))}
          </div>
          {msg && <span className="cmp-msg">{msg}</span>}
          <button className="btn" onClick={clear}>Clear</button>
          <Link className="btn btn-primary" href="/compare" aria-disabled={items.length < 2}>Compare {items.length}</Link>
        </div>
      )}
    </CompareContext.Provider>
  );
}

export const useCompare = () => useContext(CompareContext);

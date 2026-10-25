"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { findProduct, resolve, snapOf } from "@/lib/catalog";

// Client-side cart (kept in this browser only) plus the "added to cart" toast from the mockups.
const CartContext = createContext(null);
const KEY = "newcom-cart";

export function CartProvider({ children }) {
  const [lines, setLines] = useState([]); // [{ id, qty, snap }]
  const [toast, setToast] = useState("");
  const [loaded, setLoaded] = useState(false);
  const timer = useRef();

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || "[]");
      if (Array.isArray(saved)) setLines(saved.filter((l) => resolve(l)));
    } catch {}
    setLoaded(true);
  }, []);

  // only write after the saved cart has been read, so the first render can't wipe it
  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem(KEY, JSON.stringify(lines)); } catch {}
  }, [lines, loaded]);

  function notify(msg) {
    setToast(msg);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(""), 3000);
  }

  // accepts a product object (live inventory items) or an id from the sample catalogue
  function add(item, qty = 1) {
    const p = typeof item === "object" ? item : findProduct(item);
    if (!p || p.stock === "out") return;
    const id = p.id;
    setLines((cur) => {
      const ex = cur.find((l) => l.id === id);
      const next = Math.min(p.max || 5, (ex?.qty || 0) + qty);
      return ex ? cur.map((l) => (l.id === id ? { ...l, qty: next } : l)) : [...cur, { id, qty: next, snap: snapOf(p) }];
    });
    notify(`${qty > 1 ? `${qty} × ` : ""}${p.name} added.`);
  }

  // whole PC build at once (one of each part)
  function addMany(ids) {
    setLines((cur) => {
      let next = [...cur];
      ids.forEach((id) => {
        if (!findProduct(id)) return;
        next = next.some((l) => l.id === id) ? next.map((l) => (l.id === id ? { ...l, qty: l.qty + 1 } : l)) : [...next, { id, qty: 1, snap: snapOf(findProduct(id)) }];
      });
      return next;
    });
    notify(`${ids.length} build parts added.`);
  }

  const setQty =(id, qty) => setLines((cur) => cur.map((l) => (l.id === id ? { ...l, qty } : l)));
  const remove = (id) => setLines((cur) => cur.filter((l) => l.id !== id));
  const clear = () => setLines([]);
  const count = lines.reduce((a, l) => a + l.qty, 0);

  return (
    <CartContext.Provider value={{ lines, count, add, addMany, setQty, remove, clear, notify }}>
      {children}
      {toast && (
        <div role="status" className="toast">
          {toast}
          <Link href="/cart">View cart</Link>
        </div>
      )}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);

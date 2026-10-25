"use client";

import { useEffect, useState } from "react";

// "Back to top" button that appears after scrolling down; the ring shows how far down the page you are.
export default function ScrollTop() {
  const [show, setShow] = useState(false);
  const [pct, setPct] = useState(0);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - innerHeight;
        setShow(scrollY > 600);
        setPct(max > 0 ? Math.min(1, scrollY / max) : 0);
      });
    };
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
    return () => { cancelAnimationFrame(raf); removeEventListener("scroll", onScroll); };
  }, []);

  const C = 2 * Math.PI * 21;

  return (
    <button
      className={`totop no-print${show ? " on" : ""}`}
      onClick={() => scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" })}
      aria-label="Back to top"
      tabIndex={show ? 0 : -1}
    >
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <circle cx="24" cy="24" r="21" className="totop-track" />
        <circle cx="24" cy="24" r="21" className="totop-ring" style={{ strokeDasharray: C, strokeDashoffset: C * (1 - pct) }} />
        <path d="M24 31V17M17 23l7-7 7 7" className="totop-arrow" />
      </svg>
    </button>
  );
}

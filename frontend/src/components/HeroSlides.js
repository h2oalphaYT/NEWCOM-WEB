"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const check = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4ADE80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 12 5 5L20 7" /></svg>;

function Media({ s, active }) {
  const ref = useRef(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.muted = true;
    if (active && !matchMedia("(prefers-reduced-motion: reduce)").matches) v.play()?.catch(() => {});
    else v.pause();
  }, [active]);
  const cls = `hvid hslide${active ? " on" : ""}`;
  if (s.mediaType === "video") {
    return <video ref={ref} className={cls} muted loop playsInline preload={active ? "auto" : "none"} poster={s.poster} src={s.media} aria-hidden="true" />;
  }
  return <img className={cls} src={s.media || s.poster} alt="" aria-hidden="true" />;
}

// Home hero. Slides come from the admin's "home-hero" banners; the built-in slide shows when there are none.
export default function HeroSlides({ slides }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = slides.length;
  useEffect(() => {
    if (n < 2 || paused) return;
    const t = setTimeout(() => setI((x) => (x + 1) % n), 8000);
    return () => clearTimeout(t);
  }, [i, n, paused]);
  const s = slides[i];

  return (
    <>
      {slides.map((x, j) => <Media key={j} s={x} active={j === i} />)}
      <div className="hscrim" />
      <div className="htxt" key={i} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
        {s.eyebrow && <div className="h1a eyebrow-hero">{s.eyebrow}</div>}
        {i === 0 ? <h1 className="h1a" style={{ animationDelay: ".08s" }}>{s.title}</h1> : <h2 className="h1a hslide-h" style={{ animationDelay: ".08s" }}>{s.title}</h2>}
        {s.subtitle && <p className="h1a" style={{ animationDelay: ".16s" }}>{s.subtitle}</p>}
        {(s.b1 || s.b2) && (
          <div className="h1a hero-cta" style={{ animationDelay: ".24s" }}>
            {s.b1 && <Link className="btn btn-primary btn-xl" href={s.b1u || "/products"}>{s.b1}</Link>}
            {s.b2 && <Link className="btn btn-ghost btn-xl" href={s.b2u || "/pc-builder"}>{s.b2}</Link>}
          </div>
        )}
        {s.ticks && (
          <div className="h1a hero-ticks" style={{ animationDelay: ".32s" }}>
            {s.ticks.map((t) => <span key={t}>{check}{t}</span>)}
          </div>
        )}
        {n > 1 && (
          <div className="hdots" role="tablist" aria-label="Hero slides">
            {slides.map((x, j) => (
              <button key={j} role="tab" aria-selected={j === i} aria-label={`Slide ${j + 1}: ${x.title}`} className={j === i ? "on" : ""} onClick={() => setI(j)}><span /></button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

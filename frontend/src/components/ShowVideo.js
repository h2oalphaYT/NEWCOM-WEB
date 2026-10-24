"use client";

import { useEffect, useRef } from "react";

// Muted background clip for the home showcase panels. Plays only while on screen
// (saves battery and data on phones) and stays on the poster for reduced-motion users.
export default function ShowVideo({ src, poster }) {
  const ref = useRef(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.muted = true;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) v.play()?.catch(() => {});
      else v.pause();
    }, { threshold: 0.15 });
    io.observe(v);
    return () => io.disconnect();
  }, []);

  return <video ref={ref} className="show-vid" src={src} poster={poster} muted loop playsInline preload="metadata" aria-hidden="true" />;
}

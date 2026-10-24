"use client";

import { useEffect, useRef } from "react";

// Background video for the home hero; paused for people who prefer reduced motion.
export default function HeroVideo() {
  const ref = useRef(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.muted = true;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) v.pause();
    else v.play()?.catch(() => {});
  }, []);

  return (
    <video
      ref={ref}
      className="hvid"
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      poster="/media/hero-poster.jpg"
      src="/media/hero.mp4"
      aria-hidden="true"
    />
  );
}

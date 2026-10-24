"use client";

import { useEffect, useRef } from "react";

// Animated "connected network" background: drifting nodes (some drawn as tiny PCs),
// links between nearby nodes, and data packets travelling along the links.
// Runs only while visible; draws one still frame for reduced-motion users.
export default function NetworkBg() {
  const ref = useRef(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0, h = 0, raf = 0, running = false, nodes = [], packets = [];
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const LINK = 170;

    function setup() {
      const r = cv.getBoundingClientRect();
      w = r.width; h = r.height;
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.max(18, Math.min(60, Math.round((w * h) / 16000)));
      nodes = Array.from({ length: count }, (_, i) => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25,
        pc: i % 7 === 0, // every seventh node is drawn as a small PC
      }));
      packets = [];
    }

    function links() {
      const out = [];
      for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y, d = Math.hypot(dx, dy);
        if (d < LINK) out.push([i, j, d]);
      }
      return out;
    }

    function drawPc(x, y) {
      ctx.strokeStyle = "rgba(255,90,95,.9)"; ctx.lineWidth = 1.2;
      ctx.strokeRect(x - 7, y - 6, 14, 9);       // screen
      ctx.beginPath(); ctx.moveTo(x - 4, y + 6); ctx.lineTo(x + 4, y + 6); ctx.stroke(); // stand
      ctx.fillStyle = "rgba(227,30,36,.25)"; ctx.fillRect(x - 6, y - 5, 12, 7);
    }

    function frame() {
      ctx.clearRect(0, 0, w, h);
      const L = links();
      for (const [i, j, d] of L) {
        const a = nodes[i], b = nodes[j];
        ctx.strokeStyle = `rgba(227,30,36,${(1 - d / LINK) * 0.55})`;
        ctx.lineWidth = 1.1;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
      // spawn packets along random links
      if (!calm && L.length && packets.length < 14 && Math.random() < 0.08) {
        const [i, j] = L[(Math.random() * L.length) | 0];
        packets.push(Math.random() < 0.5 ? { a: i, b: j, t: 0 } : { a: j, b: i, t: 0 });
      }
      packets = packets.filter((p) => p.t <= 1);
      for (const p of packets) {
        const a = nodes[p.a], b = nodes[p.b];
        if (Math.hypot(a.x - b.x, a.y - b.y) > LINK) { p.t = 2; continue; }
        const x = a.x + (b.x - a.x) * p.t, y = a.y + (b.y - a.y) * p.t;
        const g = ctx.createRadialGradient(x, y, 0, x, y, 7);
        g.addColorStop(0, "rgba(255,120,110,.95)"); g.addColorStop(1, "rgba(227,30,36,0)");
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 7, 0, Math.PI * 2); ctx.fill();
        p.t += 0.012;
      }
      for (const n of nodes) {
        if (n.pc) drawPc(n.x, n.y);
        else { ctx.fillStyle = "rgba(255,90,95,.7)"; ctx.beginPath(); ctx.arc(n.x, n.y, 1.8, 0, Math.PI * 2); ctx.fill(); }
        if (!calm) {
          n.x += n.vx; n.y += n.vy;
          if (n.x < -10 || n.x > w + 10) n.vx *= -1;
          if (n.y < -10 || n.y > h + 10) n.vy *= -1;
        }
      }
      if (running && !calm) raf = requestAnimationFrame(frame);
    }

    setup();
    frame();
    const io = new IntersectionObserver(([e]) => {
      running = e.isIntersecting;
      cancelAnimationFrame(raf);
      if (running && !calm) raf = requestAnimationFrame(frame);
    });
    io.observe(cv);
    const ro = new ResizeObserver(() => { setup(); frame(); });
    ro.observe(cv);
    return () => { running = false; cancelAnimationFrame(raf); io.disconnect(); ro.disconnect(); };
  }, []);

  return <canvas ref={ref} className="net-bg" aria-hidden="true" />;
}

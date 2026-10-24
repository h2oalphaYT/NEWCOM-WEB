"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

// "Watch a gaming PC come together": Three.js model from the redesign mockup, with the SVG version as fallback.
const BP = [
  ["Motherboard", "mb", -240, 0], ["Processor", "cpu", 0, -150], ["Cooler", "col", 0, -190], ["Memory", "ram", 220, -40],
  ["SSD", "ssd", 0, 120], ["Graphics card", "gpu", -260, 40], ["Power supply", "psu", 0, 170], ["Cables", "cab", 0, 0],
];

export default function PcScene() {
  const [step, setStep] = useState(0);
  const [noGl, setNoGl] = useState(false);
  const stepRef = useRef(0);
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const gp = useRef({ x: 0, y: 0 });

  stepRef.current = step;

  // step driver: auto-cycles until the user scrolls, then follows scroll position
  useEffect(() => {
    const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (calm) { setStep(10); return; }
    const iv = setInterval(() => setStep((s) => (s >= 12 ? 0 : s + 1)), 1000);
    const onScroll = () => {
      const el = sectionRef.current;
      if (!el) return;
      clearInterval(iv);
      const r = el.getBoundingClientRect();
      const vh = innerHeight || 800;
      const pr = Math.max(0, Math.min(1, (vh * 0.9 - r.top) / (vh * 0.65)));
      setStep(Math.round(pr * 10));
    };
    addEventListener("scroll", onScroll, { passive: true });
    return () => { clearInterval(iv); removeEventListener("scroll", onScroll); };
  }, []);

  // three.js scene
  useEffect(() => {
    let raf, renderer, disposed = false;
    const cv = canvasRef.current;

    import("three").then((T) => {
      if (disposed || !cv) return;
      try { renderer = new T.WebGLRenderer({ canvas: cv, antialias: true, alpha: true }); } catch { setNoGl(true); return; }
      renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
      const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
      const scene = new T.Scene();
      const cam = new T.PerspectiveCamera(36, 1, 0.1, 100);
      cam.position.set(0, 1.0, 13.5);
      cam.lookAt(0, 0, 0);
      scene.add(new T.AmbientLight(0xffffff, 0.65 * Math.PI));
      const d1 = new T.DirectionalLight(0xffffff, 0.95 * Math.PI); d1.position.set(4, 6, 7); scene.add(d1);
      const d2 = new T.DirectionalLight(0xffffff, 0.4 * Math.PI); d2.position.set(-6, 2, 4); scene.add(d2);
      const glow = new T.PointLight(0xe31e24, 0, 10, 0); glow.position.set(0, -0.6, 0.6); scene.add(glow);
      const rig = new T.Group(); scene.add(rig);
      const M = (c, o) => new T.MeshStandardMaterial({ color: c, metalness: 0.55, roughness: 0.4, ...(o || {}) });
      const red = () => M(0xe31e24, { emissive: 0xe31e24, emissiveIntensity: 0.9, metalness: 0.1, roughness: 0.5 });
      const box = (w, h, d, m) => new T.Mesh(new T.BoxGeometry(w, h, d), m);
      const fans = [];
      const makeFan = (r, n) => {
        const f = new T.Group();
        f.add(new T.Mesh(new T.CylinderGeometry(r * 0.22, r * 0.22, 0.06, 20), M(0x2a2a30)).rotateX(Math.PI / 2));
        for (let i = 0; i < n; i++) {
          const piv = new T.Group(); piv.rotation.z = (i / n) * Math.PI * 2;
          const b = box(r * 0.3, r * 0.78, 0.02, M(0x8a8f99, { metalness: 0.3 }));
          b.position.y = r * 0.52; b.rotation.y = 0.5; piv.add(b); f.add(piv);
        }
        fans.push(f);
        return f;
      };

      // case
      const dark = M(0x141416, { metalness: 0.7, roughness: 0.5 });
      const back = box(4.3, 5.3, 0.1, dark); back.position.set(0, 0, -1.25);
      const floor = box(4.3, 0.1, 2.6, dark); floor.position.set(0, -2.6, 0);
      const roof = box(4.3, 0.1, 2.6, dark); roof.position.set(0, 2.6, 0);
      const rightW = box(0.1, 5.3, 2.6, dark); rightW.position.set(2.1, 0, 0);
      const glass = new T.Mesh(new T.BoxGeometry(0.04, 5.3, 2.6), new T.MeshPhysicalMaterial({ color: 0x9aa0aa, transparent: true, opacity: 0.12, roughness: 0.05, metalness: 0 }));
      glass.position.set(-2.1, 0, 0);
      const edges = new T.LineSegments(new T.EdgesGeometry(new T.BoxGeometry(4.3, 5.3, 2.6)), new T.LineBasicMaterial({ color: 0x66666e }));
      rig.add(back, floor, roof, rightW, glass, edges);

      // parts, in build order
      const parts = [];
      const add = (g, from, name) => { g.userData = { home: g.position.clone(), from: new T.Vector3(...from), k: 0, name }; g.visible = false; rig.add(g); parts.push(g); };
      let g = new T.Group(); g.position.set(0.1, 0.15, -1.1);
      g.add(box(3.1, 4.0, 0.08, M(0x1c1c20, { metalness: 0.3 })));
      [[-0.9, 1.5, 1.2], [0.3, 1.1, 1.5], [-0.6, 0.2, 1.8], [0.6, -0.4, 1.2], [-0.8, -1.2, 1.4], [0.4, -1.6, 1.6]].forEach((t, i) => {
        const tr = box(t[2], 0.025, 0.012, red()); tr.position.set(t[0], t[1], 0.05); g.add(tr);
        if (i % 2) { const v = box(0.025, 0.5, 0.012, red()); v.position.set(t[0] + t[2] / 2, t[1] - 0.25, 0.05); g.add(v); }
      });
      add(g, [-8, 0, 0], "board");
      g = new T.Group(); g.position.set(-0.3, 1.0, -1.02);
      g.add(box(0.7, 0.7, 0.06, M(0xb8bcc4, { metalness: 0.9, roughness: 0.25 })));
      add(g, [0, 7, 0], "cpu");
      g = new T.Group(); g.position.set(-0.3, 1.0, -0.6);
      g.add(new T.Mesh(new T.CylinderGeometry(0.66, 0.66, 0.5, 36), M(0x0e0e10)).rotateX(Math.PI / 2));
      const ring = new T.Mesh(new T.TorusGeometry(0.62, 0.035, 12, 48), red()); ring.position.z = 0.27; g.add(ring);
      const cf = makeFan(0.6, 7); cf.position.z = 0.22; g.add(cf);
      add(g, [0, 8, 3], "cooler");
      g = new T.Group(); g.position.set(1.1, 1.0, -0.9);
      [0, 0.3].forEach((x) => { const s = box(0.12, 1.8, 0.32, M(0x202024)); s.position.x = x; g.add(s); const st = box(0.125, 0.14, 0.325, red()); st.position.set(x, 0.86, 0); g.add(st); });
      add(g, [7, 3, 0], "ram");
      g = new T.Group(); g.position.set(-0.5, -0.3, -1.04);
      g.add(box(1.2, 0.32, 0.04, M(0x25252a)));
      const lab = box(0.5, 0.14, 0.045, red()); lab.position.x = -0.25; g.add(lab);
      add(g, [-7, -4, 3], "ssd");
      g = new T.Group(); g.position.set(-0.1, -1.15, -0.3);
      g.add(box(3.0, 0.5, 1.05, M(0x18181b)));
      const gs = box(3.0, 0.05, 1.06, red()); gs.position.y = 0.22; g.add(gs);
      [-0.75, 0.75].forEach((x) => { const gf = makeFan(0.4, 9); gf.position.set(x, 0, 0.54); g.add(gf); });
      const br = box(0.05, 0.7, 0.9, M(0xb8bcc4, { metalness: 0.9 })); br.position.set(-1.55, 0, 0); g.add(br);
      add(g, [-9, -2, 4], "gpu");
      g = new T.Group(); g.position.set(0, -2.15, -0.1);
      g.add(box(3.9, 0.8, 2.1, M(0x111113)));
      const pb = box(3.9, 0.06, 2.12, red()); pb.position.y = 0.2; g.add(pb);
      add(g, [0, -7, 3], "psu");
      g = new T.Group();
      const tube = (pts, col) => new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts.map((q) => new T.Vector3(...q))), 36, 0.05, 8, false), M(col, { metalness: 0.1, roughness: 0.6 }));
      g.add(tube([[1.5, -1.8, -0.9], [1.9, -1.1, -0.95], [1.95, 0.2, -0.95], [1.4, 0.7, -1.0]], 0xe8b923));
      g.add(tube([[1.2, -1.8, -0.8], [1.6, -0.6, -0.85], [0.9, -0.3, -0.98], [0.6, 0.1, -1.0]], 0xe31e24));
      add(g, [0, 0, 0], "cables");

      let power = 0;
      const apply = (instant) => {
        const s = calm ? 10 : stepRef.current;
        parts.forEach((part, i) => {
          const u = part.userData; const target = s >= i + 1 ? 1 : 0;
          u.k = instant ? target : u.k + (target - u.k) * 0.065;
          const e = 1 - Math.pow(1 - u.k, 3);
          part.visible = u.k > 0.004;
          part.position.set(u.home.x + u.from.x * (1 - e), u.home.y + u.from.y * (1 - e), u.home.z + u.from.z * (1 - e));
          part.scale.setScalar(u.name === "cables" ? Math.max(0.001, e) : 0.85 + 0.15 * e);
        });
        const pt = s >= 9 ? 1 : 0; power = instant ? pt : power + (pt - power) * 0.05; glow.intensity = power * 2.4 * Math.PI;
      };
      const draw = (t) => {
        const w = cv.clientWidth || 400, h = cv.clientHeight || 400;
        const pr = renderer.getPixelRatio();
        if (cv.width !== Math.round(w * pr) || cv.height !== Math.round(h * pr)) { renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); }
        rig.rotation.y = calm ? -0.5 : Math.sin(t * 0.00045) * 0.85 - 0.25 + gp.current.x * 0.45;
        rig.rotation.x = -0.1 + gp.current.y * 0.25;
        fans.forEach((f) => { f.rotation.z += calm ? 0 : 0.025 + power * 0.22; });
        renderer.render(scene, cam);
      };
      if (calm) { apply(true); draw(0); return; }
      const loop = (t) => {
        raf = requestAnimationFrame(loop);
        const r = cv.getBoundingClientRect();
        if (r.bottom < 0 || r.top > (innerHeight || 900)) return;
        apply(false); draw(t);
      };
      raf = requestAnimationFrame(loop);
    }).catch(() => setNoGl(true));

    return () => { disposed = true; cancelAnimationFrame(raf); renderer?.dispose(); };
  }, []);

  const pct = Math.round((Math.min(step, 9) / 9) * 100);
  const on = step >= 9;
  const pt = Object.fromEntries(BP.map((b, i) => {
    const vis = step >= i + 1;
    return [b[1], { transform: `translate(${vis ? 0 : b[2]}px,${vis ? 0 : b[3]}px)`, opacity: vis ? 1 : 0, transition: "transform .9s cubic-bezier(.34,1.45,.55,1),opacity .45s ease" }];
  }));

  return (
    <section id="pcscene" ref={sectionRef} className="sec">
      <div className="rv pcscene">
        <div style={{ flex: "1 1 380px", minWidth: 0 }}>
          <div className="eyebrow">Auto build preview</div>
          <h2 className="h2" style={{ marginTop: 12, lineHeight: 1.1 }}>Watch a gaming PC come together.</h2>
          <p className="sub" style={{ maxWidth: 460, lineHeight: 1.65, marginTop: 14 }}>Scroll and each part drops into place in the order a technician would fit it. Build your own and every step is checked for compatibility.</p>
          <ol className="bsteps" aria-label="Build steps">
            {BP.map((b, i) => {
              const done = step >= i + 1, cur = step === i + 1;
              return (
                <li key={b[0]} style={{ borderColor: cur ? "#E31E24" : "var(--line)", background: cur ? "var(--tint)" : "var(--bg)" }}>
                  <span aria-hidden="true" style={{ background: done ? "#15803D" : cur ? "#E31E24" : "#64748B" }}>{done ? "✓" : i + 1}</span>{b[0]}
                </li>
              );
            })}
          </ol>
          <div className="bprog" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label="Build progress"><div style={{ width: `${pct}%` }} /></div>
          <div style={{ marginTop: 20 }}><Link className="btn btn-primary btn-lg" href="/pc-builder">Build your own</Link></div>
        </div>
        <div style={{ flex: "1 1 380px", minWidth: 0, display: "flex", justifyContent: "center" }}>
          <div
            style={{ position: "relative", width: "100%", maxWidth: 540 }}
            onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); gp.current = { x: (e.clientX - r.left) / r.width - 0.5, y: (e.clientY - r.top) / r.height - 0.5 }; }}
            onMouseLeave={() => { gp.current = { x: 0, y: 0 }; }}
          >
            <div style={{ position: "relative", aspectRatio: "1/1" }}>
              <canvas ref={canvasRef} role="img" aria-label="Interactive 3D model of a PC being assembled" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: noGl ? "none" : "block" }} />
              {noGl && (
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg viewBox="0 0 400 440" style={{ width: "100%", maxWidth: 440 }} role="img" aria-label="Animation of PC parts being fitted into a case">
                    <rect x="30" y="14" width="340" height="412" rx="16" fill="#111827" stroke="#334155" strokeWidth="3" />
                    <rect x="42" y="26" width="316" height="388" rx="8" fill="#0B1220" />
                    <rect x="42" y="26" width="316" height="388" rx="8" fill="#E31E24" style={{ opacity: on ? 0.18 : 0, transition: "opacity 1s ease" }} />
                    <g style={pt.mb}><rect x="58" y="44" width="214" height="306" rx="6" fill="#1F2937" stroke="#374151" /><path d="M70 70h60v40h50M70 150h40M110 150v60h70M200 250v70M70 300h90" fill="none" stroke="#E31E24" strokeWidth="2" opacity=".6" /></g>
                    <g style={pt.cpu}><rect x="112" y="92" width="64" height="64" rx="6" fill="#94A3B8" /><rect x="122" y="102" width="44" height="44" rx="4" fill="#1E293B" /></g>
                    <g style={pt.col}><circle cx="144" cy="124" r="42" fill="#101012" stroke="#E31E24" strokeWidth="3" /><circle cx="144" cy="124" r="8" fill="#E31E24" /></g>
                    <g style={pt.ram}><rect x="214" y="70" width="12" height="110" rx="2" fill="#EF4444" /><rect x="232" y="70" width="12" height="110" rx="2" fill="#EF4444" /></g>
                    <g style={pt.ssd}><rect x="92" y="244" width="110" height="10" rx="3" fill="#60A5FA" /></g>
                    <g style={pt.gpu}><rect x="62" y="270" width="206" height="50" rx="7" fill="#1E293B" stroke="#475569" /><rect x="62" y="270" width="206" height="6" rx="3" fill="#EF4444" /><circle cx="118" cy="298" r="18" fill="#101012" /><circle cx="212" cy="298" r="18" fill="#101012" /></g>
                    <g style={pt.psu}><rect x="58" y="366" width="300" height="42" rx="6" fill="#1E293B" stroke="#475569" /><rect x="200" y="378" width="140" height="6" rx="3" fill="#EAB308" /></g>
                    <g style={pt.cab}><path d="M280 366q22-60 -8-120T230 190" fill="none" stroke="#EAB308" strokeWidth="4" strokeLinecap="round" /><path d="M290 366q26-80 -6-150" fill="none" stroke="#E31E24" strokeWidth="4" strokeLinecap="round" /></g>
                    <g style={{ opacity: on ? 1 : 0, transition: "opacity .6s ease" }}><rect x="150" y="190" width="100" height="30" rx="15" fill="#15803D" /><text x="200" y="210" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="13" fontWeight="700" fill="#fff">Powered on</text></g>
                  </svg>
                </div>
              )}
            </div>
            <p style={{ margin: "10px 0 0", textAlign: "center", fontSize: 12, color: "var(--mute)" }}>Live 3D model. Move your mouse to tilt it.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

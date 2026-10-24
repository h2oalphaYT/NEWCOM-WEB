"use client";

import { useEffect, useRef, useState } from "react";

// Live 3D preview for PC Builder v3. Every chosen part is modelled and flies into its real
// position: case first, motherboard onto the back panel, CPU into the socket, RAM into the
// slots, GPU into the PCIe slot, and so on. Drag to rotate.

const SLOT_LABEL = { case: "Case", mb: "Motherboard", cpu: "Processor", cooler: "CPU cooler", ram: "Memory", ssd: "NVMe SSD", gpu: "Graphics card", hdd: "Hard drive", psu: "Power supply", fans: "Case fans", rgb: "Lighting" };
const IN_CASE = Object.keys(SLOT_LABEL);

// where each part flies in from (offset from its home position)
const FROM = { case: [0, -6, 0], mb: [-9, 0, 2], cpu: [0, 6, 3], cooler: [0, 7, 4], ram: [5, 4, 3], ssd: [-6, -2, 4], gpu: [-9, -1, 5], hdd: [7, -3, 3], psu: [0, -7, 4], fans: [8, 0, 2], rgb: [0, 5, 5] };

export default function Builder3D({ sel, focus }) {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const api = useRef(null);
  const selRef = useRef(sel);
  const [noGl, setNoGl] = useState(false);
  const [placed, setPlaced] = useState("");

  // set up scene once
  useEffect(() => {
    let disposed = false, raf, renderer;
    const cv = canvasRef.current;

    import("three").then((T) => {
      if (disposed || !cv) return;
      try { renderer = new T.WebGLRenderer({ canvas: cv, antialias: true, alpha: true }); } catch { setNoGl(true); return; }
      renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
      const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;

      const scene = new T.Scene();
      const cam = new T.PerspectiveCamera(34, 1, 0.1, 100);
      const camHome = new T.Vector3(2.2, 1.6, 15.5);
      cam.position.copy(camHome);
      const look = new T.Vector3(0, 0, 0);
      scene.add(new T.AmbientLight(0xffffff, 0.55 * Math.PI));
      const key = new T.DirectionalLight(0xffffff, 1.0 * Math.PI); key.position.set(5, 8, 9); scene.add(key);
      const rim = new T.DirectionalLight(0xffd6d6, 0.45 * Math.PI); rim.position.set(-7, 3, -4); scene.add(rim);
      const inner = new T.PointLight(0xe31e24, 0, 9, 0); inner.position.set(0.3, 0, 0.4); scene.add(inner);
      const fill = new T.PointLight(0xffffff, 1.2 * Math.PI, 8, 0); fill.position.set(0.5, 0.8, 1.6); scene.add(fill);

      const rig = new T.Group(); scene.add(rig);
      rig.rotation.y = -0.45;

      // soft floor shadow
      const floor = new T.Mesh(new T.CircleGeometry(4.2, 48), new T.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.18 }));
      floor.rotation.x = -Math.PI / 2; floor.position.y = -2.75; rig.add(floor);

      const M = (c, o) => new T.MeshStandardMaterial({ color: c, metalness: 0.5, roughness: 0.42, ...(o || {}) });
      const glowMat = (c) => M(c, { emissive: c, emissiveIntensity: 0.9, metalness: 0.1, roughness: 0.5 });
      const box = (w, h, d, m) => new T.Mesh(new T.BoxGeometry(w, h, d), m);
      const fans = [];
      const rgbMats = [];
      const fan = (r, n = 7, ringCol) => {
        const f = new T.Group();
        const frame = new T.Mesh(new T.TorusGeometry(r, r * 0.08, 10, 40), ringCol ? glowMat(ringCol) : M(0x222226));
        if (ringCol) rgbMats.push(frame.material);
        f.add(frame);
        const hub = new T.Group();
        hub.add(new T.Mesh(new T.CylinderGeometry(r * 0.25, r * 0.25, 0.06, 20), M(0x2a2a30)).rotateX(Math.PI / 2));
        for (let i = 0; i < n; i++) {
          const piv = new T.Group(); piv.rotation.z = (i / n) * Math.PI * 2;
          const b = box(r * 0.32, r * 0.72, 0.02, M(0x8a8f99, { metalness: 0.3 })); b.position.y = r * 0.5; b.rotation.y = 0.5;
          piv.add(b); hub.add(piv);
        }
        f.add(hub); fans.push(hub);
        return f;
      };

      // ghost outline shown until a case is chosen
      const ghost = new T.LineSegments(new T.EdgesGeometry(new T.BoxGeometry(4.6, 5.3, 2.5)), new T.LineDashedMaterial({ color: 0x9a9aa2, dashSize: 0.18, gapSize: 0.12 }));
      ghost.computeLineDistances(); rig.add(ghost);

      // ---------- part builders ----------
      const build = {
        case: (p) => {
          const g = new T.Group();
          const shell = M(p.color ?? 0x141416, { metalness: 0.6, roughness: 0.45 });
          const back = box(4.6, 5.3, 0.08, shell); back.position.z = -1.25;
          const top = box(4.6, 0.08, 2.5, shell); top.position.y = 2.65;
          const bottom = box(4.6, 0.08, 2.5, shell); bottom.position.y = -2.65;
          const front = box(0.08, 5.3, 2.5, shell); front.position.x = 2.3;
          const rear = box(0.08, 5.3, 2.5, shell); rear.position.x = -2.3;
          const io = box(0.09, 0.9, 1.2, M(0x2a2a30)); io.position.set(-2.3, 1.3, -0.4);
          const glass = new T.Mesh(new T.BoxGeometry(4.6, 5.3, 0.03), new T.MeshPhysicalMaterial({ color: 0xaab0bb, transparent: true, opacity: 0.1, roughness: 0.04, metalness: 0 }));
          glass.position.z = 1.25;
          const edge = new T.LineSegments(new T.EdgesGeometry(new T.BoxGeometry(4.6, 5.3, 2.5)), new T.LineBasicMaterial({ color: 0x77777f }));
          [[-1.9, -2.75], [1.9, -2.75]].forEach(([x, y]) => { const ft = box(0.5, 0.1, 2.0, M(0x222226)); ft.position.set(x, y, 0); g.add(ft); });
          g.add(back, top, bottom, front, rear, io, glass, edge);
          return { g, home: [0, 0, 0] };
        },
        mb: (p) => {
          const atx = p.form === "ATX";
          const w = atx ? 3.0 : 2.6, h = atx ? 3.7 : 3.0;
          const g = new T.Group();
          g.add(box(w, h, 0.07, M(0x18181c, { metalness: 0.3 })));
          // copper-style traces and heatsinks
          for (let i = 0; i < 7; i++) { const tr = box(0.6 + (i % 3) * 0.4, 0.02, 0.01, glowMat(0xe31e24)); tr.position.set(-w / 2 + 0.5 + (i % 2) * 0.6, h / 2 - 0.5 - i * 0.45, 0.045); g.add(tr); }
          const vrm = box(0.35, 1.3, 0.22, M(0x3a3a42, { metalness: 0.8 })); vrm.position.set(-w / 2 + 0.35, h / 2 - 1.0, 0.13); g.add(vrm);
          const vrm2 = box(1.2, 0.3, 0.22, M(0x3a3a42, { metalness: 0.8 })); vrm2.position.set(-0.2, h / 2 - 0.3, 0.13); g.add(vrm2);
          const socket = box(0.75, 0.75, 0.05, M(0x9aa0a8, { metalness: 0.8 })); socket.position.set(-0.25, h / 2 - 1.25, 0.06); g.add(socket);
          [0.55, 0.75, 0.95, 1.15].forEach((x) => { const s = box(0.07, 1.6, 0.06, M(0x0c0c0e)); s.position.set(x, h / 2 - 1.35, 0.06); g.add(s); });
          const pcie = box(1.9, 0.08, 0.08, M(0x0c0c0e)); pcie.position.set(-0.4, h / 2 - 2.5, 0.06); g.add(pcie);
          const chipset = box(0.6, 0.6, 0.14, M(0x2c2c32, { metalness: 0.8 })); chipset.position.set(0.7, -h / 2 + 0.6, 0.09); g.add(chipset);
          const x = -0.35, y = 1.2 - (h / 2 - 1.25); // keeps the CPU socket at (-0.6, 1.2) on both sizes
          g.userData.anchor = { x, y, h };
          return { g, home: [x, y, -1.17] };
        },
        cpu: () => {
          const g = new T.Group();
          g.add(box(0.62, 0.62, 0.06, M(0xc4c8cf, { metalness: 0.95, roughness: 0.2 })));
          const lbl = box(0.3, 0.1, 0.005, glowMat(0xe31e24)); lbl.position.set(0, -0.12, 0.033); g.add(lbl);
          return { g, home: [-0.6, 1.2, -1.07] };
        },
        cooler: (p) => {
          const g = new T.Group();
          if (p.aio) {
            const pump = new T.Mesh(new T.CylinderGeometry(0.42, 0.42, 0.3, 36), M(0x111114)); pump.rotation.x = Math.PI / 2; pump.position.set(-0.6, 1.2, -0.88); g.add(pump);
            const ring = new T.Mesh(new T.TorusGeometry(0.4, 0.035, 10, 40), glowMat(0xe31e24)); ring.position.set(-0.6, 1.2, -0.72); rgbMats.push(ring.material); g.add(ring);
            const rad = box(3.6, 0.16, 1.2, M(0x1a1a1d)); rad.position.set(0.1, 2.4, -0.15); g.add(rad);
            [-1.1, 0.1, 1.3].forEach((x) => { const f = fan(0.5, 7, 0xe31e24); f.rotation.x = Math.PI / 2; f.position.set(x, 2.22, -0.15); g.add(f); });
            const tube = (pts) => new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts.map((q) => new T.Vector3(...q))), 30, 0.05, 8, false), M(0x111114, { roughness: 0.8 }));
            g.add(tube([[-0.5, 1.35, -0.8], [-0.2, 1.9, -0.6], [0.6, 2.25, -0.4]]), tube([[-0.7, 1.35, -0.8], [-0.9, 1.95, -0.55], [-1.3, 2.25, -0.35]]));
          } else {
            const fins = box(0.85, 1.2, 0.7, M(0xb6bac2, { metalness: 0.9, roughness: 0.3 })); fins.position.set(-0.6, 1.2, -0.65); g.add(fins);
            for (let i = 0; i < 9; i++) { const ln = box(0.86, 0.02, 0.71, M(0x7c808a)); ln.position.set(-0.6, 0.65 + i * 0.13, -0.65); g.add(ln); }
            const f = fan(0.5, 7); f.rotation.y = Math.PI / 2; f.position.set(-0.1, 1.2, -0.65); g.add(f);
            const top = box(0.88, 0.06, 0.73, M(0x1a1a1d)); top.position.set(-0.6, 1.81, -0.65); g.add(top);
          }
          return { g, home: [0, 0, 0] };
        },
        ram: (p) => {
          const g = new T.Group();
          const n = p.sticks || 2;
          for (let i = 0; i < n; i++) {
            const s = new T.Group();
            s.add(box(0.07, 1.55, 0.38, M(0x1d1d22, { metalness: 0.6 })));
            const bar = box(0.075, 0.12, 0.39, p.rgb ? glowMat(0xff3b3b) : M(0xc4161c, { metalness: 0.5 }));
            if (p.rgb) rgbMats.push(bar.material);
            bar.position.y = 0.78; s.add(bar);
            s.position.x = i * 0.4;
            g.add(s);
          }
          return { g, home: [0.4, 1.1, -0.93] };
        },
        ssd: () => {
          const g = new T.Group();
          g.add(box(1.0, 0.24, 0.03, M(0x1f1f24)));
          const lbl = box(0.45, 0.16, 0.035, glowMat(0x2563eb)); lbl.position.x = -0.2; g.add(lbl);
          return { g, home: [-0.45, 0.45, -1.08] };
        },
        gpu: (p) => {
          const L = p.len / 100;
          const g = new T.Group();
          g.add(box(L, 0.55, 1.05, M(0x17171b)));
          const shroud = box(L, 0.06, 1.06, glowMat(0xe31e24)); shroud.position.y = 0.26; rgbMats.push(shroud.material); g.add(shroud);
          const backplate = box(L, 0.04, 1.05, M(0x3a3a42, { metalness: 0.9 })); backplate.position.y = 0.3; g.add(backplate);
          const nf = L > 3 ? 3 : 2;
          for (let i = 0; i < nf; i++) { const f = fan(0.38, 9); f.rotation.x = Math.PI / 2; f.position.set(-L / 2 + (L / nf) * (i + 0.5), -0.29, 0); g.add(f); }
          const bracket = box(0.05, 0.75, 0.95, M(0xb8bcc4, { metalness: 0.9 })); bracket.position.x = -L / 2 - 0.02; g.add(bracket);
          return { g, home: [-2.25 + L / 2 + 0.05, -0.35, -0.58] };
        },
        hdd: () => {
          const g = new T.Group();
          g.add(box(0.9, 0.22, 1.1, M(0x8f949c, { metalness: 0.9, roughness: 0.3 })));
          const lbl = box(0.5, 0.005, 0.6, M(0x1f1f24)); lbl.position.y = 0.113; g.add(lbl);
          return { g, home: [1.55, -2.1, -0.2] };
        },
        psu: (p) => {
          const g = new T.Group();
          g.add(box(1.7, 0.85, 1.6, M(0x111113)));
          const f = fan(0.55, 9); f.rotation.x = Math.PI / 2; f.position.set(0, -0.43, 0); g.add(f);
          const band = box(1.71, 0.05, 1.61, glowMat(0xe31e24)); band.position.y = 0.3; g.add(band);
          const tube = (pts, col) => new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts.map((q) => new T.Vector3(...q))), 36, 0.05, 8, false), M(col, { metalness: 0.1, roughness: 0.6 }));
          g.add(tube([[0.7, 0.4, -0.5], [1.6, 0.9, -0.6], [1.75, 2.2, -0.65], [1.2, 2.8, -0.7]], 0xe8b923));
          g.add(tube([[0.5, 0.4, -0.3], [1.3, 1.0, -0.4], [1.45, 2.0, -0.55], [0.9, 2.5, -0.6]], 0xe31e24));
          g.userData.watts = p.w;
          return { g, home: [-1.35, -2.15, -0.25] };
        },
        fans: (p) => {
          const g = new T.Group();
          const n = p.count || 3;
          for (let i = 0; i < n; i++) { const f = fan(0.58, 7, p.rgb ? 0xe31e24 : null); f.rotation.y = Math.PI / 2; f.position.set(0, 1.55 - i * 1.4, 0); g.add(f); }
          return { g, home: [2.15, 0, 0.05] };
        },
        rgb: () => {
          const g = new T.Group();
          [[0, 2.55, 1.15, 4.4, 0.04, 0.04], [2.2, 0, 1.15, 0.04, 5.0, 0.04]].forEach(([x, y, z, w, h, d]) => {
            const s = box(w, h, d, glowMat(0xff2d55)); rgbMats.push(s.material); s.position.set(x, y, z); g.add(s);
          });
          return { g, home: [0, 0, 0] };
        },
      };

      const live = {}; // slot -> { id, g, home, from, k, dir }
      const disposeTree = (o) => o.traverse((c) => { c.geometry?.dispose(); if (c.material && !Array.isArray(c.material)) c.material.dispose(); });

      let outN = 0;
      function setPart(slot, part) {
        const cur = live[slot];
        if (cur && part && cur.id === part.id) return;
        if (cur) { cur.dir = -1; live[`out#${outN++}`] = cur; delete live[slot]; } // flies out, removed when done
        if (!part || !build[slot]) return;
        const { g, home } = build[slot](part);
        const from = FROM[slot] || [0, 6, 0];
        g.position.set(home[0] + from[0], home[1] + from[1], home[2] + from[2]);
        g.visible = false;
        rig.add(g);
        live[slot] = { slot, id: part.id, g, home, from, k: 0, dir: 1 };
      }

      // orbit by drag
      const view = { yaw: -0.45, pitch: -0.05, drag: null, idle: 0, zoom: 1 };
      const onDown = (e) => { view.drag = { x: e.clientX, y: e.clientY, yaw: view.yaw, pitch: view.pitch }; cv.setPointerCapture?.(e.pointerId); };
      const onMove = (e) => { if (!view.drag) return; view.yaw = view.drag.yaw + (e.clientX - view.drag.x) * 0.008; view.pitch = Math.max(-0.5, Math.min(0.4, view.drag.pitch + (e.clientY - view.drag.y) * 0.004)); view.idle = 0; };
      const onUp = () => { view.drag = null; };
      cv.addEventListener("pointerdown", onDown); cv.addEventListener("pointermove", onMove); addEventListener("pointerup", onUp);

      let power = 0, focusPos = null, focusT = 0;
      api.current = {
        sync(selNow) { IN_CASE.forEach((s) => setPart(s, selNow[s])); ghost.visible = !selNow.case; },
        focus(slot) {
          const l = live[slot];
          if (!l) return;
          focusPos = new T.Vector3(...l.home); focusT = 1;
          if (slot === "case") focusPos.set(0, 0, 0);
        },
      };
      api.current.sync(selRef.current);

      const easeOutBack = (x) => { const c1 = 1.4, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
      let last = performance.now();
      const loop = (t) => {
        raf = requestAnimationFrame(loop);
        const dt = Math.min(0.1, (t - last) / 1000); last = t;
        const r = cv.getBoundingClientRect();
        const offscreen = r.bottom < 0 || r.top > innerHeight;

        // animate parts in / out
        Object.keys(live).forEach((k) => {
          const l = live[k];
          l.k = Math.max(0, Math.min(1, l.k + (calm ? 1 : dt * 1.25) * l.dir));
          const e = l.dir > 0 ? easeOutBack(l.k) : l.k * l.k;
          l.g.visible = l.k > 0.003;
          l.g.position.set(l.home[0] + l.from[0] * (1 - e), l.home[1] + l.from[1] * (1 - e), l.home[2] + l.from[2] * (1 - e));
          l.g.rotation.z = (1 - e) * (l.slot === "case" ? 0 : 0.6);
          if (l.dir < 0 && l.k === 0) { rig.remove(l.g); disposeTree(l.g); delete live[k]; }
        });

        // power on once board, CPU and PSU are in
        const on = live.mb?.k > 0.95 && live.cpu?.k > 0.95 && live.psu?.k > 0.95 ? 1 : 0;
        power += (on - power) * 0.04;
        inner.intensity = power * 3 * Math.PI;
        const hue = (t * 0.00008) % 1;
        rgbMats.forEach((m) => { if (power > 0.5) m.emissive.setHSL(hue, 0.9, 0.5); m.emissiveIntensity = 0.35 + power * 0.9; });
        fans.forEach((f) => { f.rotation.z += calm ? 0 : dt * (1.5 + power * 14); });

        // camera: idle sway, drag, and a short zoom toward the part just fitted
        view.idle += dt;
        const sway = view.drag || calm ? 0 : Math.sin(t * 0.0004) * 0.25 * Math.min(1, view.idle / 3);
        rig.rotation.y += (view.yaw + sway - rig.rotation.y) * 0.08;
        rig.rotation.x += (view.pitch - rig.rotation.x) * 0.08;
        focusT = Math.max(0, focusT - dt * 0.45);
        const z = focusT > 0 ? 1 - 0.22 * Math.sin(Math.min(1, focusT) * Math.PI) : 1;
        view.zoom += (z - view.zoom) * 0.1;
        const tgt = focusPos && focusT > 0 ? focusPos.clone().applyEuler(rig.rotation).multiplyScalar(0.5) : new T.Vector3();
        look.lerp(tgt, 0.06);
        cam.position.set(camHome.x * view.zoom, camHome.y * view.zoom, camHome.z * view.zoom);
        cam.lookAt(look);

        if (offscreen) return; // parts keep moving, but skip drawing
        const w = cv.clientWidth || 400, h = cv.clientHeight || 400, pr = renderer.getPixelRatio();
        if (cv.width !== Math.round(w * pr) || cv.height !== Math.round(h * pr)) { renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); }
        renderer.render(scene, cam);
      };
      raf = requestAnimationFrame(loop);
      // dev-only hook so tests can step the animation when the tab is in the background
      if (process.env.NODE_ENV !== "production") window.__b3d = { live, tick: (n = 60) => { for (let i = 0; i < n; i++) { cancelAnimationFrame(raf); loop(last + 50); } } };

      api.current.cleanup = () => { cv.removeEventListener("pointerdown", onDown); cv.removeEventListener("pointermove", onMove); removeEventListener("pointerup", onUp); };
    }).catch(() => setNoGl(true));

    return () => { disposed = true; cancelAnimationFrame(raf); api.current?.cleanup?.(); renderer?.dispose(); api.current = null; };
  }, []);

  // push selection changes into the scene
  useEffect(() => {
    selRef.current = sel;
    api.current?.sync(sel);
  }, [sel]);

  useEffect(() => {
    if (!focus || !SLOT_LABEL[focus]) return;
    const t1 = setTimeout(() => api.current?.focus(focus), 50);
    setPlaced(sel[focus] ? `${SLOT_LABEL[focus]} installed` : "");
    const t2 = setTimeout(() => setPlaced(""), 2200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [focus, sel]);

  const count = IN_CASE.filter((s) => sel[s]).length;

  return (
    <div ref={wrapRef} className="b3d">
      <canvas ref={canvasRef} role="img" aria-label="3D preview of your PC build. Drag to rotate." style={{ display: noGl ? "none" : "block" }} />
      {noGl && <div className="b3d-fallback">3D preview needs WebGL. Your build list and checks still work.</div>}
      {count === 0 && !noGl && <div className="b3d-hint">Pick a case to start. Each part you choose is fitted here in 3D.</div>}
      {placed && <div className="b3d-toast msg" role="status">✓ {placed}</div>}
      <div className="b3d-foot">Drag to rotate · {count}/{IN_CASE.length} parts fitted</div>
    </div>
  );
}

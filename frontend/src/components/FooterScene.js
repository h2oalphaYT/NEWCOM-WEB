"use client";

import { useEffect, useRef, useState } from "react";

// Footer animation: the plug slides into the wall socket, the PC powers on (fans spin,
// RGB lights up), then two monitors, keyboard, mouse and headset drop onto the desk and
// the screens boot. Plays each time the footer scrolls into view.
export default function FooterScene() {
  const ref = useRef(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { setOn(true); return; }
    const io = new IntersectionObserver(([e]) => setOn(e.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={`fscene${on ? " on" : ""}`} aria-hidden="true">
      <svg viewBox="0 0 1200 300" preserveAspectRatio="xMidYMax meet">
        <defs>
          <linearGradient id="fs-scr" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#E31E24" stopOpacity=".55" />
            <stop offset="1" stopColor="#120608" stopOpacity=".95" />
          </linearGradient>
          <radialGradient id="fs-glow"><stop offset="0" stopColor="#E31E24" stopOpacity=".55" /><stop offset="1" stopColor="#E31E24" stopOpacity="0" /></radialGradient>
        </defs>

        {/* desk */}
        <rect x="150" y="262" width="900" height="10" rx="3" fill="#1D1D24" />
        <rect x="170" y="272" width="10" height="28" fill="#16161C" /><rect x="1020" y="272" width="10" height="28" fill="#16161C" />
        <ellipse className="fs-deskglow" cx="600" cy="262" rx="420" ry="18" fill="url(#fs-glow)" />

        {/* wall socket + cable + plug */}
        <g transform="translate(1110 150)">
          <rect x="-26" y="-34" width="52" height="68" rx="10" fill="#1A1A20" stroke="#34343E" />
          <circle cx="-8" cy="-6" r="4" fill="#0A0A0D" /><circle cx="8" cy="-6" r="4" fill="#0A0A0D" /><rect x="-3" y="10" width="6" height="9" rx="2" fill="#0A0A0D" />
          <circle className="fs-led" cx="0" cy="-24" r="3" fill="#3A3A42" />
        </g>
        <path className="fs-cable" d="M985 250 C1040 250, 1050 170, 1086 160" fill="none" stroke="#2A2A32" strokeWidth="6" strokeLinecap="round" />
        <path className="fs-current" d="M985 250 C1040 250, 1050 170, 1086 160" fill="none" stroke="#FF4A4F" strokeWidth="2.5" strokeLinecap="round" />
        <g className="fs-plug"><rect x="1074" y="148" width="22" height="24" rx="5" fill="#2E2E36" /><rect x="1096" y="152" width="8" height="4" fill="#9CA3AF" /><rect x="1096" y="164" width="8" height="4" fill="#9CA3AF" /></g>
        <g className="fs-spark"><path d="M1100 140l6 -10M1112 150l12 -4M1104 176l8 8" stroke="#FFB4B4" strokeWidth="2" strokeLinecap="round" /></g>

        {/* PC tower */}
        <g transform="translate(900 120)">
          <rect width="110" height="142" rx="8" fill="#121217" stroke="#2C2C35" />
          <rect x="8" y="8" width="72" height="126" rx="4" fill="#0A0A0E" stroke="#22222A" />
          <rect className="fs-rgb" x="8" y="8" width="72" height="126" rx="4" fill="none" stroke="#E31E24" strokeWidth="2" />
          {[40, 92].map((cy) => (
            <g key={cy}>
              <circle cx="44" cy={cy} r="22" fill="none" stroke="#2A2A32" strokeWidth="3" />
              <circle className="fs-fanring" cx="44" cy={cy} r="22" fill="none" stroke="#FF3B3F" strokeWidth="3" />
              <g className="fs-fan" style={{ transformOrigin: `44px ${cy}px` }}>
                <path d={`M44 ${cy - 16}v32M28 ${cy}h32M33 ${cy - 11}l22 22M55 ${cy - 11}l-22 22`} stroke="#4B4B55" strokeWidth="4" strokeLinecap="round" />
              </g>
            </g>
          ))}
          <circle className="fs-power" cx="95" cy="18" r="5" fill="#3A3A42" />
          <rect x="86" y="30" width="16" height="3" rx="1.5" fill="#2A2A32" /><rect x="86" y="37" width="16" height="3" rx="1.5" fill="#2A2A32" />
        </g>

        {/* dual monitors */}
        {[{ x: 300, d: "0s" }, { x: 560, d: ".15s" }].map((m, i) => (
          <g key={m.x} className="fs-mon" style={{ animationDelay: `calc(var(--t-mon) + ${m.d})` }}>
            <g transform={`translate(${m.x} 92)`}>
              <rect width="240" height="140" rx="8" fill="#0E0E12" stroke="#2C2C35" strokeWidth="2" />
              <rect x="8" y="8" width="224" height="124" rx="3" fill="#050507" />
              <g className="fs-screen" style={{ animationDelay: `calc(var(--t-boot) + ${m.d})` }}>
                <rect x="8" y="8" width="224" height="124" rx="3" fill="url(#fs-scr)" />
                {i === 0 ? (
                  <>
                    <path d="M8 120 L60 70 L95 100 L140 50 L232 118 L232 132 L8 132Z" fill="#E31E24" opacity=".35" />
                    <circle cx="186" cy="40" r="14" fill="#FF6B6B" opacity=".6" />
                  </>
                ) : (
                  <>
                    {[30, 50, 70, 90].map((y, k) => <rect key={y} x="22" y={y} width={[150, 110, 170, 90][k]} height="8" rx="4" fill="#FF8A8E" opacity=".45" />)}
                    <rect x="190" y="28" width="30" height="70" rx="4" fill="#E31E24" opacity=".35" />
                  </>
                )}
                <text x="120" y="76" textAnchor="middle" className="fs-logo" fill="#fff">NEWCOM</text>
              </g>
              <rect x="108" y="140" width="24" height="22" fill="#1A1A20" />
              <rect x="80" y="162" width="80" height="8" rx="4" fill="#24242C" />
            </g>
          </g>
        ))}

        {/* keyboard */}
        <g className="fs-kbd">
          <rect x="400" y="246" width="250" height="16" rx="5" fill="#16161C" stroke="#2C2C35" />
          <rect className="fs-kbdglow" x="404" y="249" width="242" height="10" rx="3" fill="#E31E24" />
        </g>
        {/* mouse */}
        <g className="fs-mouse"><ellipse cx="700" cy="254" rx="14" ry="9" fill="#1A1A20" stroke="#2C2C35" /><path className="fs-kbdglow" d="M700 246v8" stroke="#FF3B3F" strokeWidth="2" /></g>
        {/* headset on a stand */}
        <g className="fs-head">
          <rect x="226" y="200" width="6" height="62" fill="#24242C" /><rect x="212" y="258" width="34" height="5" rx="2" fill="#24242C" />
          <path d="M204 222 a25 25 0 0 1 50 0" fill="none" stroke="#2C2C35" strokeWidth="7" strokeLinecap="round" />
          <rect x="196" y="216" width="14" height="26" rx="6" fill="#1A1A20" /><rect x="248" y="216" width="14" height="26" rx="6" fill="#1A1A20" />
          <circle className="fs-hled" cx="203" cy="229" r="3" fill="#FF3B3F" />
        </g>
      </svg>
    </div>
  );
}

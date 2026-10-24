// SVG product illustrations from the ProductArt mockup component (used until real product photos exist).
const names = { gpu: "graphics card", cpu: "processor", ram: "memory module", ssd: "NVMe SSD", laptop: "laptop", monitor: "monitor", psu: "power supply", case: "PC case", mouse: "mouse", keyboard: "keyboard", headset: "headset" };

export default function ProductArt({ kind = "gpu", accent = "#E31E24" }) {
  const a = accent;
  const label = `Illustration of a ${names[kind] || "product"}`;
  const svg = (children) => (
    <div className="pa">
      <svg viewBox="0 0 240 180" role="img" aria-label={label}>{children}</svg>
    </div>
  );

  switch (kind) {
    case "cpu":
      return svg(<>
        <ellipse cx="120" cy="156" rx="70" ry="7" fill="#000" opacity=".12" />
        <rect x="56" y="22" width="128" height="128" rx="10" fill="#CBD5E1" />
        <rect x="64" y="30" width="112" height="112" rx="6" fill="#E2E8F0" stroke="#94A3B8" />
        <rect x="82" y="48" width="76" height="76" rx="6" fill="#94A3B8" />
        <rect x="90" y="56" width="60" height="60" rx="4" fill="#1E293B" />
        <path d="M104 78h32M104 86h32M104 94h24" stroke={a} strokeWidth="3" strokeLinecap="round" />
        <path d="M64 30l16 0-16 16z" fill={a} />
        <rect x="68" y="146" width="104" height="4" fill="#B8923F" />
      </>);
    case "ram":
      return svg(<>
        <ellipse cx="120" cy="156" rx="100" ry="7" fill="#000" opacity=".12" />
        {[40, 104].map((y) => (
          <g key={y}>
            <rect x="14" y={y} width="212" height="46" rx="4" fill="#1E293B" />
            <rect x="14" y={y} width="212" height="12" rx="4" fill={a} />
            {[32, 66, 148, 182].map((x) => <rect key={x} x={x} y={y + 20} width="26" height="18" rx="2" fill="#0F172A" />)}
            <rect x="14" y={y + 46} width="212" height="8" fill="#B8923F" />
          </g>
        ))}
      </>);
    case "ssd":
      return svg(<>
        <ellipse cx="120" cy="140" rx="100" ry="7" fill="#000" opacity=".12" />
        <rect x="16" y="64" width="208" height="58" rx="5" fill="#0F172A" />
        <rect x="20" y="68" width="200" height="50" rx="3" fill="#1E293B" />
        <rect x="34" y="76" width="44" height="34" rx="3" fill="#0B1220" /><rect x="86" y="76" width="44" height="34" rx="3" fill="#0B1220" /><rect x="138" y="76" width="34" height="34" rx="3" fill="#0B1220" />
        <rect x="34" y="76" width="44" height="6" rx="2" fill={a} />
        <rect x="200" y="70" width="18" height="46" rx="2" fill="#B8923F" />
        <path d="M204 70v46M210 70v46" stroke="#1E293B" strokeWidth="2" />
        <circle cx="26" cy="93" r="4" fill="#0B1220" />
      </>);
    case "laptop":
      return svg(<>
        <ellipse cx="120" cy="154" rx="104" ry="7" fill="#000" opacity=".12" />
        <rect x="44" y="26" width="152" height="96" rx="8" fill="#1E293B" />
        <rect x="50" y="32" width="140" height="84" rx="3" fill="#0B1220" />
        <rect x="50" y="32" width="140" height="84" rx="3" fill={a} opacity=".28" />
        <path d="M62 100l30-30 22 18 24-34 40 46z" fill={a} opacity=".55" />
        <path d="M18 128h204l-10 18H28z" fill="#94A3B8" />
        <rect x="28" y="124" width="184" height="6" rx="3" fill="#64748B" />
        <path d="M36 134h168" stroke="#475569" strokeWidth="3" strokeDasharray="6 4" />
        <rect x="100" y="140" width="40" height="4" rx="2" fill="#64748B" />
      </>);
    case "monitor":
      return svg(<>
        <ellipse cx="120" cy="164" rx="70" ry="6" fill="#000" opacity=".12" />
        <rect x="22" y="18" width="196" height="116" rx="7" fill="#1E293B" />
        <rect x="28" y="24" width="184" height="100" rx="3" fill="#0B1220" />
        <rect x="28" y="24" width="184" height="100" rx="3" fill={a} opacity=".3" />
        <circle cx="150" cy="62" r="22" fill={a} opacity=".7" />
        <path d="M28 124l56-40 40 28 30-24 58 36z" fill={a} opacity=".45" />
        <rect x="110" y="134" width="20" height="22" fill="#475569" />
        <rect x="80" y="156" width="80" height="8" rx="4" fill="#64748B" />
      </>);
    case "psu":
      return svg(<>
        <ellipse cx="110" cy="152" rx="90" ry="7" fill="#000" opacity=".12" />
        <rect x="30" y="38" width="160" height="108" rx="8" fill="#1E293B" />
        <circle cx="110" cy="92" r="40" fill="#0F172A" stroke="#334155" strokeWidth="2" />
        <g className="fan"><path d="M110 56v72M74 92h72M84 66l52 52M136 66 84 118" stroke="#64748B" strokeWidth="4" strokeLinecap="round" /></g>
        <circle cx="110" cy="92" r="8" fill={a} />
        <rect x="30" y="38" width="160" height="7" rx="3" fill={a} />
        <path d="M190 70q30 0 30 24t-30 24" fill="none" stroke="#475569" strokeWidth="7" />
        <path d="M190 100q24 0 24 18" fill="none" stroke={a} strokeWidth="5" />
      </>);
    case "case":
      return svg(<>
        <ellipse cx="120" cy="164" rx="76" ry="6" fill="#000" opacity=".12" />
        <rect x="64" y="10" width="112" height="150" rx="8" fill="#1E293B" />
        <rect x="72" y="18" width="96" height="120" rx="4" fill="#0B1220" />
        <rect x="72" y="18" width="96" height="120" rx="4" fill={a} opacity=".16" />
        {[48, 92].map((y) => (
          <g key={y}><circle cx="102" cy={y} r="16" fill="none" stroke={a} strokeWidth="3" className="led" /><circle cx="102" cy={y} r="4" fill={a} /></g>
        ))}
        <rect x="132" y="30" width="26" height="12" rx="2" fill="#334155" /><rect x="132" y="104" width="30" height="8" rx="2" fill="#334155" />
        <rect x="72" y="144" width="96" height="8" rx="2" fill="#0B1220" />
        <rect x="76" y="160" width="14" height="6" fill="#475569" /><rect x="150" y="160" width="14" height="6" fill="#475569" />
      </>);
    case "mouse":
      return svg(<>
        <ellipse cx="120" cy="156" rx="44" ry="6" fill="#000" opacity=".12" />
        <path d="M120 14c-30 0-46 22-46 60v34c0 28 18 44 46 44s46-16 46-44V74c0-38-16-60-46-60z" fill="#1E293B" />
        <path d="M120 14c-24 0-38 14-44 40h44z" fill="#334155" /><path d="M120 14c24 0 38 14 44 40h-44z" fill="#2B3A52" />
        <path d="M120 14v40" stroke="#0B1220" strokeWidth="3" />
        <rect x="114" y="30" width="12" height="22" rx="6" fill={a} />
        <path d="M74 92h92" stroke={a} strokeWidth="3" className="led" />
      </>);
    case "keyboard":
      return svg(<>
        <ellipse cx="120" cy="140" rx="104" ry="7" fill="#000" opacity=".12" />
        <rect x="12" y="54" width="216" height="74" rx="8" fill="#1E293B" />
        <g fill="#334155">
          {[64, 82].map((y) => [22, 42, 62, 82, 102, 122, 142, 162, 182].map((x) => <rect key={`${x}-${y}`} x={x} y={y} width="16" height="14" rx="2" />))}
          <rect x="22" y="100" width="26" height="14" rx="2" /><rect x="52" y="100" width="120" height="14" rx="2" /><rect x="176" y="100" width="16" height="14" rx="2" /><rect x="196" y="100" width="12" height="14" rx="2" />
        </g>
        <rect x="12" y="124" width="216" height="4" rx="2" fill={a} className="led" />
      </>);
    case "headset":
      return svg(<>
        <ellipse cx="120" cy="164" rx="70" ry="6" fill="#000" opacity=".12" />
        <path d="M50 104V84a70 70 0 0 1 140 0v20" fill="none" stroke="#334155" strokeWidth="12" strokeLinecap="round" />
        <path d="M60 90a60 60 0 0 1 120 0" fill="none" stroke={a} strokeWidth="3" strokeLinecap="round" opacity=".7" />
        <rect x="30" y="86" width="40" height="64" rx="16" fill="#1E293B" /><rect x="36" y="94" width="14" height="48" rx="7" fill="#0B1220" />
        <rect x="170" y="86" width="40" height="64" rx="16" fill="#1E293B" /><rect x="190" y="94" width="14" height="48" rx="7" fill="#0B1220" />
        <circle cx="43" cy="118" r="4" fill={a} className="led" />
        <path d="M42 150q4 22 40 20" fill="none" stroke="#475569" strokeWidth="4" strokeLinecap="round" /><circle cx="86" cy="170" r="5" fill="#475569" />
      </>);
    default:
      return svg(<>
        <ellipse cx="120" cy="150" rx="100" ry="8" fill="#000" opacity=".12" />
        <rect x="8" y="48" width="9" height="96" rx="2" fill="#94A3B8" />
        <rect x="18" y="56" width="208" height="80" rx="9" fill="#1E293B" />
        <rect x="18" y="56" width="208" height="8" rx="4" fill={a} />
        <rect x="36" y="136" width="130" height="8" fill="#B8923F" />
        <path d="M44 136v8M54 136v8M64 136v8M74 136v8M84 136v8M94 136v8M104 136v8M114 136v8M124 136v8M134 136v8M144 136v8M154 136v8" stroke="#1E293B" strokeWidth="2" />
        {[72, 164].map((cx) => (
          <g key={cx}>
            <circle cx={cx} cy="98" r="29" fill="#0F172A" stroke="#334155" strokeWidth="2" />
            <g className="fan"><path d={`M${cx} 72v52M${cx - 26} 98h52M${cx - 18} 80l36 36M${cx + 18} 80 ${cx - 18} 116`} stroke="#64748B" strokeWidth="4" strokeLinecap="round" /></g>
            <circle cx={cx} cy="98" r="7" fill={a} />
          </g>
        ))}
        <rect x="200" y="72" width="16" height="4" rx="2" fill={a} className="led" />
      </>);
  }
}

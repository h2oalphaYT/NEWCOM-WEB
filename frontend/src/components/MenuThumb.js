import { siAmd, siAsus, siCorsair, siHp, siIntel, siLenovo, siMsi, siNvidia } from "simple-icons";
import ProductArt from "@/components/ProductArt";
import { thumbFor } from "@/lib/menu";

const logos = { amd: siAmd, asus: siAsus, corsair: siCorsair, hp: siHp, intel: siIntel, lenovo: siLenovo, msi: siMsi, nvidia: siNvidia };

// Small square picture shown beside each menu item.
export default function MenuThumb({ label }) {
  const t = thumbFor(label);
  if (t.img) return <span className="mthumb"><img src={t.img} alt="" loading="lazy" /></span>;
  if (t.logo) {
    const i = logos[t.logo];
    const dark = ["000000", "231F20"].includes(i.hex);
    return <span className="mthumb logo"><svg viewBox="0 0 24 24" aria-hidden="true" style={{ fill: dark ? "var(--ink)" : `#${i.hex}` }}><path d={i.path} /></svg></span>;
  }
  if (t.size) {
    // size comparison: three screens drawn to scale, the chosen size highlighted
    const scr = [[24, 3, 15, 14, 8], [27, 12, 12, 16, 10], [32, 22, 8, 20, 13]];
    return (
      <span className="mthumb art" aria-hidden="true">
        <svg viewBox="0 0 44 30" width="34" height="24">
          {scr.map(([s, x, y, w, h]) => (
            <rect key={s} x={x} y={y} width={w} height={h} rx="1.2" fill={s === t.size ? "#E31E24" : "none"} stroke={s === t.size ? "#FF6B70" : "#5B5B66"} strokeWidth="1" opacity={s === t.size ? 1 : 0.8} />
          ))}
          <path d="M8 28h28" stroke="#5B5B66" strokeWidth="1" />
        </svg>
      </span>
    );
  }
  return <span className="mthumb art"><ProductArt kind={t.kind} accent="#E31E24" /></span>;
}

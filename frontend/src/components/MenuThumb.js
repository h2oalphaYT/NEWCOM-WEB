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
  return <span className="mthumb art"><ProductArt kind={t.kind} accent="#E31E24" /></span>;
}

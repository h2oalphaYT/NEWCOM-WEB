import {
  siAmd, siAsus, siCorsair, siDell, siHp, siHyperx, siIntel, siKingstontechnology, siLenovo, siMsi, siNvidia, siRazer, siSamsung,
} from "simple-icons";

// Row of brand marks in the footer, muted until hovered.
const brands = [siAsus, siMsi, siAmd, siIntel, siNvidia, siCorsair, siSamsung, siKingstontechnology, siLenovo, siHp, siDell, siRazer, siHyperx];

export default function FooterBrands() {
  return (
    <div className="fbrands" aria-label="Brands we carry">
      {brands.map((b) => {
        const dark = ["000000", "231F20"].includes(b.hex);
        return (
          <span key={b.slug} className="fbrand" style={{ "--bc": dark ? "#FFFFFF" : `#${b.hex}` }} title={b.title}>
            <svg viewBox="0 0 24 24" role="img" aria-label={b.title}><path d={b.path} /></svg>
          </span>
        );
      })}
      <span className="fbrand word">GIGABYTE</span>
      <span className="fbrand word">Logitech G</span>
    </div>
  );
}

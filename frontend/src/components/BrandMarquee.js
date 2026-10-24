import {
  siAcer, siAmd, siAsus, siCoolermaster, siCorsair, siDell, siElgato, siHp, siHyperx, siIntel, siKingstontechnology,
  siLenovo, siMsi, siNvidia, siNzxt, siRazer, siSamsung, siSeagate, siSteelseries, siTplink,
} from "simple-icons";

// Brand logo slider using the official marks from simple-icons (CC0 SVG paths).
// Logos sit in a muted tone and light up in their brand colour on hover.
const rowA = [siAsus, siMsi, siAmd, siIntel, siNvidia, siCorsair, siSamsung, siKingstontechnology, siSeagate, siTplink];
const rowB = [siLenovo, siHp, siDell, siAcer, siRazer, siSteelseries, siHyperx, siCoolermaster, siNzxt, siElgato];
const words = ["GIGABYTE", "Logitech G"]; // brands without an icon in the set, shown as wordmarks

function Logo({ icon }) {
  const light = ["000000", "231F20", "101010", "1E1E28"].includes(icon.hex); // near-black brands stay neutral
  return (
    <span className="bm-logo" style={{ "--bc": light ? "var(--ink)" : `#${icon.hex}` }} title={icon.title}>
      <svg viewBox="0 0 24 24" role="img" aria-label={icon.title}><path d={icon.path} /></svg>
      <span>{icon.title.replace(" Technology", "")}</span>
    </span>
  );
}

function Row({ items, extra, reverse }) {
  const list = (
    <>
      {items.map((i) => <Logo key={i.slug} icon={i} />)}
      {extra.map((w) => <span key={w} className="bm-logo bm-word" style={{ "--bc": "var(--ink)" }}>{w}</span>)}
    </>
  );
  return (
    <div className={`bm-track${reverse ? " rev" : ""}`}>
      <div className="bm-run">{list}</div>
      <div className="bm-run" aria-hidden="true">{list}</div>
    </div>
  );
}

export default function BrandMarquee() {
  return (
    <section className="bm" aria-label="Brands we stock">
      <div className="bm-head">
        <span className="pill-eyebrow">Official brands</span>
        <h2 className="h2">The names you trust, <span className="grad">all in one place.</span></h2>
      </div>
      <div className="bm-rows">
        <Row items={rowA} extra={[words[0]]} />
        <Row items={rowB} extra={[words[1]]} reverse />
      </div>
    </section>
  );
}

import { lkr } from "@/lib/site";

export default function ProductCard({ p }) {
  return (
    <article className="card pcard">
      <div className="thumb">{p.image ? <img src={p.image} alt="" loading="lazy" /> : "No image"}</div>
      <div className="name">{p.name}</div>
      <div className="meta">{[p.brand, p.id].filter(Boolean).join(" · ")}</div>
      <div className="price">{p.price ? lkr(p.price) : "Call for price"}</div>
      <div className="meta" style={{ color: p.stock > 0 ? "var(--okfg)" : "var(--mute)" }}>{p.stock > 0 ? "In stock" : "Check availability"}</div>
    </article>
  );
}

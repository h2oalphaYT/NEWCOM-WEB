import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { getItems, toProduct } from "@/lib/api";
import { menus, linkFor } from "@/lib/menu";
import { site } from "@/lib/site";

const perks = [
  ["Island-wide delivery", "Fast shipping nationwide"],
  ["Manufacturer warranty", "All products fully covered"],
  ["Secure payments", "Pay with confidence"],
  ["Dedicated support", `Call ${site.phone}`],
];

export default async function Home() {
  const res = await getItems({ row_count: 8 });
  const products = res.ok ? res.payload.map(toProduct) : [];

  return (
    <div className="wrap">
      <section className="hero">
        <h1>Laptops, components and custom PCs in Colombo</h1>
        <p className="lead" style={{ margin: 0 }}>{site.tagline}. Shop from Newcom&apos;s live stock or build your own PC with compatibility checks.</p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href="/products" className="btn btn-primary">Shop products</Link>
          <Link href="/pc-builder" className="btn">Build your PC</Link>
        </div>
      </section>

      <div className="perks">
        {perks.map(([t, s]) => (
          <div key={t} className="card perk"><strong>{t}</strong><span>{s}</span></div>
        ))}
      </div>

      <h2 className="section-title">Browse by category</h2>
      <div className="chips">
        {menus.map((m) => <Link key={m.label} href={linkFor(m.label)} className="chip">{m.label}</Link>)}
      </div>

      <h2 className="section-title">Latest in stock</h2>
      {res.ok ? (
        <div className="grid">{products.map((p, i) => <ProductCard key={p.id ?? i} p={p} />)}</div>
      ) : (
        <div className="notice">Products will appear here once the inventory API is running. ({res.message})</div>
      )}
    </div>
  );
}

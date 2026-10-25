import Link from "next/link";
import { notFound } from "next/navigation";
import AddBuildButton from "@/components/AddBuildButton";
import { slotName } from "@/components/PrebuiltCard";
import { assetUrl, getPrebuilt } from "@/lib/api";
import { koko, productHref } from "@/lib/catalog";
import { lkr, whatsappLink } from "@/lib/site";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const res = await getPrebuilt(slug);
  return res.ok ? { title: res.payload.Name, description: res.payload.Tagline || undefined } : { title: "Pre-built PC" };
}

export default async function PrebuiltPage({ params }) {
  const { slug } = await params;
  const res = await getPrebuilt(slug);
  if (!res.ok) notFound();
  const b = res.payload;
  const img = assetUrl(b.ImageUrl) || "/media/cat/desktop.webp";
  const parts = b.parts || [];
  const item = {
    id: `PB-${b.Slug}`, name: b.Name, brand: "Newcom", category: "Pre-built PCs", kind: "case",
    price: Number(b.Price) || 0, stock: b.Price > 0 ? "in" : "request", max: 3,
    img, fallbackImg: "/media/cat/desktop.webp",
  };

  return (
    <div className="wrap" style={{ paddingBottom: 80 }}>
      <nav className="crumbs" aria-label="Breadcrumb" style={{ fontSize: 14, color: "var(--mute)" }}>
        <Link href="/">Home</Link> / <Link href="/prebuilt">Pre-built PCs</Link> / <span>{b.Name}</span>
      </nav>
      <div className="pb-detail">
        <div className="pb-hero"><img src={img} alt={b.Name} /></div>
        <div className="pb-info">
          <div className="pb-tags static">
            {b.Tier && <span>{b.Tier}</span>}
            {b.UseCase && <span>{b.UseCase}</span>}
            {b.Platform && <span className={`pb-plat ${b.Platform}`}>{b.Platform === "amd" ? "AMD" : "Intel"}</span>}
          </div>
          <h1>{b.Name}</h1>
          {b.Tagline && <p className="sub">{b.Tagline}</p>}
          <div className="pb-buy">
            <strong>{b.Price > 0 ? lkr(b.Price) : "Price on request"}</strong>
            {b.Price > 0 && <span>or 3 × {lkr(koko(b.Price))} with KOKO</span>}
            <span className={`pb-stock ${b.allInStock ? "in" : "req"}`}>{b.allInStock ? "All parts in stock, ready to build" : "Some parts are on order; we will confirm the date"}</span>
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 20 }}>
            {b.Price > 0 && <AddBuildButton item={item} />}
            <a className="btn btn-xl" href={whatsappLink(`Hi Newcom, I'm interested in the ${b.Name} pre-built PC.`)} target="_blank" rel="noopener noreferrer">Ask on WhatsApp</a>
          </div>
          <Link href="/pc-builder" style={{ display: "inline-block", marginTop: 14, color: "var(--link)", fontWeight: 600 }}>Want to change a part? Open the PC builder →</Link>
        </div>
      </div>

      <section style={{ marginTop: 40 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800 }}>What's inside</h2>
        <div className="pb-spec card">
          {parts.map((p, i) => (
            <div key={i} className="pb-spec-row">
              <em>{slotName(p.slot)}</em>
              <span>{p.itemCode ? <Link href={productHref(p.itemCode)}>{p.name}</Link> : p.name}{p.qty > 1 ? ` × ${p.qty}` : ""}</span>
              {p.stock && <small className={p.stock === "Out of Stock" ? "out" : "in"}>{p.stock}</small>}
            </div>
          ))}
          {parts.length === 0 && <p className="sub" style={{ padding: 16 }}>Part list coming soon.</p>}
        </div>
      </section>

      {b.Description && (
        <section style={{ marginTop: 32, maxWidth: 820 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800 }}>About this build</h2>
          <div className="sub" style={{ marginTop: 10, lineHeight: 1.7, whiteSpace: "pre-line" }}>{b.Description}</div>
        </section>
      )}
    </div>
  );
}

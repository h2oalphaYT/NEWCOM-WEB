import Link from "next/link";
import PrebuiltCard from "@/components/PrebuiltCard";
import { getPrebuilts } from "@/lib/api";
import { whatsappLink } from "@/lib/site";

export const metadata = { title: "Pre-built PCs", description: "Ready-made gaming, creator and office PCs, assembled and tested by Newcom." };

export default async function PrebuiltList({ searchParams }) {
  const sp = await searchParams;
  const res = await getPrebuilts();
  const all = res.ok ? res.payload || [] : [];
  const use = sp?.use || "";
  const tier = sp?.tier || "";
  const list = all.filter((b) => (!use || b.UseCase === use) && (!tier || b.Tier === tier));
  const uses = [...new Set(all.map((b) => b.UseCase).filter(Boolean))];
  const tiers = [...new Set(all.map((b) => b.Tier).filter(Boolean))];
  const chip = (label, href, on) => <Link key={label} href={href} className={`pb-chip${on ? " on" : ""}`}>{label}</Link>;

  return (
    <div className="wrap" style={{ paddingBottom: 80 }}>
      <span className="pill-eyebrow">Desktop PCs</span>
      <h1 style={{ fontSize: "clamp(30px, 5vw, 44px)", fontWeight: 800, marginTop: 12 }}>Pre-built PCs</h1>
      <p className="sub" style={{ maxWidth: 620, marginTop: 10 }}>Assembled, tested and covered by warranty. Prices follow our live stock, so what you see is what we can build today.</p>

      {(uses.length > 0 || tiers.length > 0) && (
        <div className="pb-chips" aria-label="Filter builds">
          {chip("All", "/prebuilt", !use && !tier)}
          {uses.map((u) => chip(u, `/prebuilt?use=${encodeURIComponent(u)}`, use === u))}
          {tiers.map((t) => chip(t, `/prebuilt?tier=${encodeURIComponent(t)}`, tier === t))}
        </div>
      )}

      {list.length > 0 ? (
        <div className="pb-grid" style={{ marginTop: 24 }}>{list.map((b) => <PrebuiltCard key={b.PrebuiltId} b={b} />)}</div>
      ) : (
        <div className="empty" style={{ padding: "56px 24px", marginTop: 24 }}>
          <strong style={{ fontSize: 20 }}>{all.length ? "No builds match this filter" : "New builds are on the way"}</strong>
          <p>Tell us your budget and what you play or work on, and we will put together a build for you.</p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
            <Link className="btn btn-primary" href="/pc-builder">Build your own</Link>
            <a className="btn" href={whatsappLink("Hi Newcom, I'd like a quote for a pre-built PC.")} target="_blank" rel="noopener noreferrer">Ask on WhatsApp</a>
          </div>
        </div>
      )}
    </div>
  );
}

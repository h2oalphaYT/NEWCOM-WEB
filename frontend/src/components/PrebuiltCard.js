import Link from "next/link";
import { lkr } from "@/lib/site";
import { assetUrl } from "@/lib/api";

const KEY_SLOTS = ["cpu", "gpu", "ram", "ssd"];
const SLOT = { cpu: "CPU", gpu: "Graphics", ram: "Memory", ssd: "Storage", mb: "Motherboard", psu: "Power", case: "Case", cooler: "Cooler", hdd: "HDD", fans: "Fans", os: "OS", other: "Extra" };
export const slotName = (s) => SLOT[s] || s;

// Card for a ready-made build from /admin → Pre-built PCs (price and stock come from the linked parts).
export default function PrebuiltCard({ b }) {
  const img = assetUrl(b.ImageUrl) || "/media/cat/desktop.webp";
  const key = (b.parts || []).filter((p) => KEY_SLOTS.includes(p.slot)).slice(0, 4);
  return (
    <Link href={`/prebuilt/${encodeURIComponent(b.Slug)}`} className="pb-card rvs">
      <div className="pb-media">
        <img src={img} alt="" loading="lazy" />
        <div className="pb-tags">
          {b.Tier && <span>{b.Tier}</span>}
          {b.UseCase && <span>{b.UseCase}</span>}
          {b.Platform && <span className={`pb-plat ${b.Platform}`}>{b.Platform === "amd" ? "AMD" : "Intel"}</span>}
        </div>
      </div>
      <div className="pb-body">
        <strong className="pb-name">{b.Name}</strong>
        {b.Tagline && <span className="pb-tag">{b.Tagline}</span>}
        {key.length > 0 && (
          <ul className="pb-parts">
            {key.map((p, i) => <li key={i}><em>{slotName(p.slot)}</em><span>{p.name}</span></li>)}
          </ul>
        )}
        <div className="pb-foot">
          <span className="pb-price">{b.Price > 0 ? lkr(b.Price) : "Price on request"}</span>
          <span className={`pb-stock ${b.allInStock ? "in" : "req"}`}>{b.allInStock ? "Ready to build" : "Some parts on order"}</span>
        </div>
      </div>
    </Link>
  );
}

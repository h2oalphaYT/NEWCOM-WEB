import Link from "next/link";
import BrandMarquee from "@/components/BrandMarquee";
import HeroVideo from "@/components/HeroVideo";
import PcScene from "@/components/PcScene";
import ProductArt from "@/components/ProductArt";
import ProductCard from "@/components/ProductCard";
import Reviews from "@/components/Reviews";
import ShowVideo from "@/components/ShowVideo";
import { bestSellers, byIds, categoryHref, extraCategories, newArrivals } from "@/lib/catalog";
import { site } from "@/lib/site";

const check = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4ADE80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 12 5 5L20 7" /></svg>;

// thin duotone glyphs for the trust ribbon (filled shape + hairline outline)
const glyph = {
  truck: <><path className="g-fill" d="M3 7h11v9H3z" /><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7M7 19.5a1.8 1.8 0 1 0 0-.01M17.5 19.5a1.8 1.8 0 1 0 0-.01" /></>,
  shield: <><path className="g-fill" d="M12 3 5 6v5c0 4.4 3 8.2 7 9.5 4-1.3 7-5.1 7-9.5V6z" /><path d="M12 3 5 6v5c0 4.4 3 8.2 7 9.5 4-1.3 7-5.1 7-9.5V6zM9 12l2.2 2.2L15.5 10" /></>,
  card: <><path className="g-fill" d="M3 6h18v4H3z" /><path d="M3 6h18v12H3zM3 10h18M7 15h4" /></>,
  chat: <><path className="g-fill" d="M20 11.5a7.5 7.5 0 0 1-11 6.6L4 19.5l1.4-4.5A7.5 7.5 0 1 1 20 11.5z" /><path d="M20 11.5a7.5 7.5 0 0 1-11 6.6L4 19.5l1.4-4.5A7.5 7.5 0 1 1 20 11.5zM9 11.5h.01M12.5 11.5h.01M16 11.5h.01" /></>,
};

const trust = [
  { g: "truck", t: "Island-wide delivery", s: "Tracked shipping to every district" },
  { g: "shield", t: "Official warranty", s: "Full manufacturer coverage" },
  { g: "card", t: "Secure payments", s: "Card, bank, KOKO and Mintpay" },
  { g: "chat", t: "Expert guidance", s: "Talk to a technician on WhatsApp" },
];

// category bento: size + art + colour per tile
const bento = [
  { n: "Graphics cards", s: "GeForce RTX and Radeon RX", img: "gpu", cls: "b-xl c-red", tag: "Most popular" },
  { n: "Laptops", s: "Gaming, creator and business", img: "laptop", cls: "b-tall c-violet" },
  { n: "Processors", s: "Intel Core and AMD Ryzen", img: "cpu", cls: "c-amber" },
  { n: "Monitors", s: "High refresh and colour accurate", img: "monitor", cls: "c-cyan" },
  { n: "Memory and storage", s: "DDR5, NVMe and SSD", img: "memory", cls: "c-blue" },
  { n: "Desktop PCs", s: "Ready builds and workstations", img: "desktop", cls: "b-wide c-ink" },
  { n: "Peripherals", s: "Keyboards, mice and headsets", img: "peripherals", cls: "c-green" },
];

const paths = [
  { n: "Gamers", t: "High refresh, high frame rates", s: "Graphics cards, gaming monitors and cases with room to breathe.", l: "Gaming hardware", c: "Graphics cards" },
  { n: "Creators", t: "Fast storage and colour-ready screens", s: "Memory, NVMe drives and displays for editing and design.", l: "Creator picks", c: "Memory and storage" },
  { n: "Developers", t: "Quiet, dependable workstations", s: "Laptops and desktops with plenty of RAM and cores.", l: "Workstations", c: "Laptops" },
  { n: "Students", t: "Light, affordable and reliable", s: "Everyday laptops, printers and accessories.", l: "Student essentials", c: "Laptops" },
];

const checks = ["CPU and motherboard socket match", "Memory generation (DDR4 / DDR5) match", "Estimated power draw against PSU wattage", "GPU length against case clearance"];
const guides = [
  { c: "GPU", t: "How to choose a graphics card for your monitor", kind: "gpu", accent: "#FF3B3B" },
  { c: "Upgrades", t: "RAM and SSD upgrades: what fits your PC", kind: "ssd", accent: "#3B82F6" },
  { c: "Building", t: "Gaming PC compatibility checklist", kind: "case", accent: "#E31E24" },
];

const Arrow = () => <span className="cta-ico" aria-hidden="true">→</span>;

function SectionHead({ eyebrow, title, accent, sub, href, link }) {
  return (
    <div className="sec-head">
      <div>
        {eyebrow && <span className="pill-eyebrow">{eyebrow}</span>}
        <h2 className="h2">{title} {accent && <span className="grad">{accent}</span>}</h2>
        {sub && <p className="sub">{sub}</p>}
      </div>
      {href && <Link className="cta cta-ghost" href={href}>{link}<Arrow /></Link>}
    </div>
  );
}

export default function Home() {
  return (
    <>
      <div className="sp" aria-hidden="true" />

      <section className="hero">
        <HeroVideo />
        <div className="hscrim" />
        <div className="htxt">
          <div className="h1a eyebrow-hero">Computer hardware, Sri Lanka</div>
          <h1 className="h1a" style={{ animationDelay: ".08s" }}>Performance hardware, chosen with care.</h1>
          <p className="h1a" style={{ animationDelay: ".16s" }}>Laptops, gaming PCs and components with clear specs, honest stock status and real support. {site.tagline}.</p>
          <div className="h1a hero-cta" style={{ animationDelay: ".24s" }}>
            <Link className="btn btn-primary btn-xl" href="/products">Shop products</Link>
            <Link className="btn btn-ghost btn-xl" href="/pc-builder">Build your PC</Link>
          </div>
          <div className="h1a hero-ticks" style={{ animationDelay: ".32s" }}>
            <span>{check}Stock shown per item</span>
            <span>{check}Compatibility-checked builds</span>
          </div>
        </div>
        {/* spec bar: one glass strip inside the hero, brand-red icons with a soft neon glow */}
        <div className="trust" aria-label="Why buy from Newcom">
          {trust.map((x) => (
            <div key={x.t} className="trust-item">
              <span className="trust-orb"><svg viewBox="0 0 24 24" aria-hidden="true">{glyph[x.g]}</svg></span>
              <span className="trust-txt"><strong>{x.t}</strong><span>{x.s}</span></span>
            </div>
          ))}
        </div>
      </section>


      <section className="sec">
        <SectionHead eyebrow="Shop by category" title="Everything for your setup," accent="in one place." href="/products" link="All products" />
        <div className="bento">
          {bento.map((c) => (
            <Link key={c.n} href={categoryHref(c.n)} className={`bento-tile ${c.cls} rvs`}>
              <img className="bento-img" src={`/media/cat/${c.img}.webp`} alt="" loading="lazy" />
              <span className="bento-shade" aria-hidden="true" />
              <span className="bento-glow" aria-hidden="true" />
              <span className="bento-txt">
                {c.tag && <em>{c.tag}</em>}
                <strong>{c.n}</strong>
                <span>{c.s}</span>
              </span>
              <span className="bento-go" aria-hidden="true">→</span>
            </Link>
          ))}
          <Link href="/pre-owned" className="bento-tile c-used rvs">
            <span className="bento-glow" aria-hidden="true" />
            <span className="bento-txt"><em>Tested + warranty</em><strong>Certified pre-owned</strong><span>Save on laptops, GPUs and workstations</span></span>
            <span className="bento-go" aria-hidden="true">→</span>
          </Link>
        </div>
        <div className="mini-cats">
          {extraCategories.map((c) => (
            <Link key={c.n} className="mini-cat" href={categoryHref(c.n)}><strong>{c.n}</strong><span>{c.s}</span></Link>
          ))}
        </div>
      </section>

      <section className="sec">
        <SectionHead eyebrow="Best sellers" title="What Sri Lanka is" accent="building with." sub="Sample products and prices until the live catalogue is connected." href="/products" link="View all" />
        <div className="pgrid">{byIds(bestSellers).map((p) => <ProductCard key={p.id} p={p} />)}</div>
      </section>

      <section className="sec showcase">
        <Link href="/pc-builder" className="show show-gpu rvl">
          <ShowVideo src="/media/show-gpu.mp4" poster="/media/show-gpu.jpg" />
          <span className="show-shade" aria-hidden="true" />
          <span className="show-glow" aria-hidden="true" />
          <div className="show-txt">
            <span className="pill-eyebrow dark">Gaming performance</span>
            <h2>Build around the GPU <span className="grad">that fits your screen.</span></h2>
            <p>Pick the graphics card first. The builder checks CPU, board, memory and power against it, and fits every part in 3D.</p>
            <div className="chipset"><span>GeForce RTX 40</span><span>Radeon RX 7000</span><span>Ray tracing</span><span>DLSS / FSR</span></div>
            <span className="cta cta-light">Start a build<Arrow /></span>
          </div>
        </Link>
        <Link href={categoryHref("Memory and storage")} className="show show-sto rvr">
          <ShowVideo src="/media/show-storage.mp4" poster="/media/show-storage.jpg" />
          <span className="show-shade" aria-hidden="true" />
          <span className="show-glow" aria-hidden="true" />
          <div className="show-txt">
            <span className="pill-eyebrow dark">Upgrades</span>
            <h2>Faster storage. <span className="grad cool">More memory.</span></h2>
            <p>NVMe drives and DDR5 kits for the PC you already own, filtered by interface, capacity and generation.</p>
            <div className="chipset"><span>NVMe Gen4</span><span>DDR5</span><span>DDR4</span><span>Up to 4TB</span></div>
            <span className="cta cta-light">Shop upgrades<Arrow /></span>
          </div>
        </Link>
      </section>

      <section className="sec">
        <SectionHead eyebrow="New arrivals" title="Just landed" accent="at Newcom." sub="Driven by the date-added field in the live catalogue. Sample items shown." />
        <div className="pgrid">{byIds(newArrivals).map((p) => <ProductCard key={p.id} p={p} />)}</div>
      </section>

      <section className="paths-wrap">
        <div className="sec" style={{ paddingTop: 80, paddingBottom: 80 }}>
          <SectionHead eyebrow="Shop by need" title="Hardware for" accent="the way you work." />
          <div className="paths">
            {paths.map((u) => (
              <Link key={u.n} className="cat rv path" href={categoryHref(u.c)}>
                <span className="path-n">{u.n}</span>
                <span className="path-t">{u.t}</span>
                <span className="path-s">{u.s}</span>
                <span className="path-l">{u.l} →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <PcScene />

      <section className="sec">
        <div className="rv builder-cta">
          <div style={{ flex: "1 1 380px", minWidth: 0 }}>
            <span className="pill-eyebrow">PC builder</span>
            <h2 className="h2" style={{ lineHeight: 1.1 }}>Build your PC with a <span className="grad">compatibility check.</span></h2>
            <p className="sub" style={{ marginTop: 16, lineHeight: 1.65, maxWidth: 460 }}>Pick parts by category and see CPU socket, memory generation, power draw and case clearance validated as you go. Where data is missing, we say so.</p>
            <div style={{ marginTop: 28, display: "flex", flexWrap: "wrap", gap: 12 }}>
              <Link className="cta" href="/pc-builder">Open the builder<Arrow /></Link>
              <Link className="cta cta-ghost" href="/pc-builder">Request a quotation<Arrow /></Link>
            </div>
          </div>
          <ul className="ticks">
            {checks.map((k) => (
              <li key={k}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#15803D" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 12 5 5L20 7" /></svg>{k}</li>
            ))}
          </ul>
        </div>
      </section>

      <BrandMarquee />

      <Reviews />

      <section className="sec" style={{ paddingBottom: 96 }}>
        <SectionHead eyebrow="Buying guides" title="Choose with" accent="confidence." />
        <div className="cats guides">
          {guides.map((g) => (
            <Link key={g.t} className="cat rvs guide" href="/products">
              <div className="guide-img"><ProductArt kind={g.kind} accent={g.accent} /></div>
              <div style={{ padding: 20 }}><div className="path-n" style={{ fontSize: 12 }}>{g.c}</div><div className="guide-t">{g.t}</div></div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}

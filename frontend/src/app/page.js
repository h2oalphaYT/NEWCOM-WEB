import Link from "next/link";
import HeroVideo from "@/components/HeroVideo";
import PcScene from "@/components/PcScene";
import ProductCard from "@/components/ProductCard";
import { bestSellers, byIds, categories, categoryHref, newArrivals } from "@/lib/catalog";
import { site } from "@/lib/site";

const check = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4ADE80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 12 5 5L20 7" /></svg>;

const strip = [
  { t: "Island-wide delivery", s: "Fast shipping nationwide", d: "M1 3h15v13H1zM16 8h4l3 3v5h-7zM5.5 19a1.5 1.5 0 1 0 .01 0M18.5 19a1.5 1.5 0 1 0 .01 0" },
  { t: "Manufacturer warranty", s: "All products fully covered", d: "M12 2 4 5v6c0 5 3.4 9 8 11 4.6-2 8-6 8-11V5z" },
  { t: "Secure payments", s: "Pay with confidence", d: "M5 11h14v10H5zM8 11V7a4 4 0 0 1 8 0v4" },
  { t: "Product guidance", s: `WhatsApp ${site.whatsapp}`, d: "M21 12a8 8 0 0 1-11.6 7.1L3 21l1.9-6.2A8 8 0 1 1 21 12z" },
];

const paths = [
  { n: "Gamers", t: "High refresh, high frame rates", s: "Graphics cards, gaming monitors and cases with room to breathe.", l: "Gaming hardware", c: "Graphics cards" },
  { n: "Creators", t: "Fast storage and colour-ready screens", s: "Memory, NVMe drives and displays for editing and design.", l: "Creator picks", c: "Memory and storage" },
  { n: "Developers", t: "Quiet, dependable workstations", s: "Laptops and desktops with plenty of RAM and cores.", l: "Workstations", c: "Laptops" },
  { n: "Students", t: "Light, affordable and reliable", s: "Everyday laptops, printers and accessories.", l: "Student essentials", c: "Laptops" },
];

const checks = ["CPU and motherboard socket match", "Memory generation (DDR4 / DDR5) match", "Estimated power draw against PSU wattage", "GPU length against case clearance"];
const brands = ["ASUS", "MSI", "GIGABYTE", "AMD", "INTEL", "NVIDIA", "CORSAIR", "LOGITECH", "KINGSTON", "SAMSUNG"];
const why = [
  { t: "Warranty assistance", s: "[Describe the real warranty process and how to claim.]" },
  { t: "Genuine products", s: "[State authorised-dealer status only if verified.]" },
  { t: "Delivery", s: "[State real coverage, fees and timelines.]" },
  { t: "After-sales service", s: "[Describe repairs, upgrades and support channels.]" },
];
const guides = [
  { c: "GPU", t: "How to choose a graphics card for your monitor" },
  { c: "Upgrades", t: "RAM and SSD upgrades: what fits your PC" },
  { c: "Building", t: "Gaming PC compatibility checklist" },
];

function SectionHead({ title, sub, href, link }) {
  return (
    <div className="sec-head">
      <div>
        <h2 className="h2">{title}</h2>
        {sub && <p className="sub">{sub}</p>}
      </div>
      {href && <Link className="lk" href={href}>{link} →</Link>}
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
        <div className="cue" aria-hidden="true"><span /></div>
      </section>

      <section className="strip">
        <div className="strip-in">
          {strip.map((s) => (
            <div key={s.t} className="strip-item">
              <span className="ico"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={s.d} /></svg></span>
              <span><strong>{s.t}</strong><span>{s.s}</span></span>
            </div>
          ))}
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 88 }}>
        <SectionHead title="Shop by category" href="/products" link="All categories" />
        <div className="cats">
          {categories.map((c) => (
            <Link key={c.n} className="cat rvs cat-tile" href={categoryHref(c.n)}>
              <span className="ico-lg"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={c.d} /></svg></span>
              <span><strong>{c.n}</strong><span>{c.s}</span></span>
            </Link>
          ))}
        </div>
      </section>

      <section className="sec">
        <SectionHead title="Best sellers" sub="Sample products and prices for demonstration. Connect the live catalogue to populate." href="/products" link="View all" />
        <div className="pgrid">{byIds(bestSellers).map((p) => <ProductCard key={p.id} p={p} />)}</div>
      </section>

      <section className="sec promos">
        <div className="rvl promo promo-dark">
          <span className="eyebrow" style={{ color: "#FF6B70" }}>Gaming performance</span>
          <h2>Build around the graphics card that fits your screen.</h2>
          <p>Start with the GPU, then let the builder check CPU, board, memory and power supply against it.</p>
          <Link className="btn btn-white" href="/pc-builder">Start a build</Link>
        </div>
        <div className="rvr promo promo-tint">
          <span className="eyebrow">Upgrades</span>
          <h2>Faster storage and more memory for the PC you own.</h2>
          <p>Browse SSDs and RAM with filters for interface, capacity and generation.</p>
          <Link className="btn btn-primary" href={categoryHref("Memory and storage")}>Shop upgrades</Link>
        </div>
      </section>

      <section className="sec">
        <SectionHead title="New arrivals" sub="Driven by the “date added” field in the live catalogue. Sample items shown." />
        <div className="pgrid">{byIds(newArrivals).map((p) => <ProductCard key={p.id} p={p} />)}</div>
      </section>

      <section className="paths-wrap">
        <div className="sec" style={{ paddingTop: 80, paddingBottom: 80 }}>
          <h2 className="h2">Hardware for the way you work</h2>
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
            <h2 className="h2" style={{ lineHeight: 1.1 }}>Build your PC with a compatibility check.</h2>
            <p className="sub" style={{ marginTop: 16, lineHeight: 1.65, maxWidth: 460 }}>Pick parts by category and see CPU socket, memory generation, power draw and case clearance validated as you go. Where data is missing, we say so.</p>
            <div style={{ marginTop: 28, display: "flex", flexWrap: "wrap", gap: 12 }}>
              <Link className="btn btn-primary btn-lg" href="/pc-builder">Open the builder</Link>
              <Link className="btn btn-lg" href="/pc-builder">Request a quotation</Link>
            </div>
          </div>
          <ul className="ticks">
            {checks.map((k) => (
              <li key={k}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#15803D" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 12 5 5L20 7" /></svg>{k}</li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-label="Brands" className="brands">
        <div className="mq">
          {brands.map((b) => <span key={b}>{b}</span>)}
          {brands.map((b) => <span key={`d-${b}`} aria-hidden="true">{b}</span>)}
        </div>
      </section>

      <section className="sec two-col">
        <div>
          <h2 className="h2">Why shop with Newcom</h2>
          <p className="sub" style={{ fontSize: 14 }}>Each point below needs confirmation from Newcom before launch.</p>
          <div style={{ marginTop: 24, display: "grid", gap: 12 }}>
            {why.map((w) => <div key={w.t} className="why"><strong>{w.t}</strong><span>{w.s}</span></div>)}
          </div>
        </div>
        <div>
          <h2 className="h2">Customer reviews</h2>
          <div className="empty" style={{ marginTop: 24 }}>
            <strong>No verified reviews connected yet</strong>
            <p>Link the Google reviews feed here to show real ratings, reviewer names and a link to the original source. Invented testimonials are never shown.</p>
          </div>
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 64, paddingBottom: 96 }}>
        <SectionHead title="Buying guides" />
        <div className="cats">
          {guides.map((g) => (
            <Link key={g.t} className="cat rvs guide" href="/products">
              <div className="guide-img">Article image placeholder</div>
              <div style={{ padding: 20 }}><div className="path-n" style={{ fontSize: 12 }}>{g.c}</div><div className="guide-t">{g.t}</div></div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}

import Link from "next/link";
import FooterBrands from "@/components/FooterBrands";
import FooterScene from "@/components/FooterScene";
import { site, whatsappLink } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="ftr" id="support">
      <FooterScene />
      <FooterBrands />
      <div className="ftr-in">
        <div className="ftr-grid">
          <div>
            <Link href="/" aria-label="Newcom home" style={{ display: "inline-block" }}>
              <img src="/brand/newcom-logo-dark.png" alt={`Newcom: ${site.tagline}`} style={{ display: "block", height: 44, width: "auto" }} />
            </Link>
            <p>{site.tagline}.</p>
            <p>
              {site.address}
              <br />
              <a href={site.phoneHref}>{site.phone}</a>
              <br />
              <a href={`mailto:${site.email}`}>{site.email}</a>
            </p>
          </div>
          <div>
            <h4>Shop</h4>
            <div className="ftr-links">
              <Link href="/products?q=Laptops">Laptops</Link>
              <Link href="/products?q=Desktop">Desktop PCs</Link>
              <Link href="/products?q=Graphics">Graphics cards</Link>
              <Link href="/products?q=Monitor">Monitors</Link>
              <Link href="/pre-owned">Certified pre-owned</Link>
              <Link href="/pc-builder">Build your PC</Link>
            </div>
          </div>
          <div>
            <h4>Opening hours</h4>
            <div className="soft" style={{ marginTop: 0 }}>
              {site.hours.map((h) => (
                <div key={h.days}>{h.days}: {h.time}</div>
              ))}
            </div>
          </div>
          <div>
            <h4>Get in touch</h4>
            <div className="ftr-links">
              <Link href="/contact">Contact us</Link>
              <Link href="/support/warranty">Warranty claims</Link>
              <Link href="/services">Repairs and services</Link>
              <Link href="/compare">Compare products</Link>
              <a href={whatsappLink()} target="_blank" rel="noopener noreferrer">WhatsApp {site.whatsapp}</a>
              <a href={site.social.facebook} target="_blank" rel="noopener noreferrer">Facebook</a>
              <a href={site.social.instagram} target="_blank" rel="noopener noreferrer">Instagram</a>
            </div>
          </div>
        </div>
        <div className="ftr-bottom">
          <span>© {new Date().getFullYear()} {site.legalName}. All rights reserved.</span>
          <span>Brand names belong to their owners.</span>
        </div>
      </div>
    </footer>
  );
}

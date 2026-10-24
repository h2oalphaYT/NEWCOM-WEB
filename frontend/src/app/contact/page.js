import Link from "next/link";
import { site, whatsappLink } from "@/lib/site";

export const metadata = { title: "Contact us" };

export default function Contact() {
  return (
    <div className="wrap">
      <nav aria-label="Breadcrumb" className="crumbs">
        <Link href="/">Home</Link><span aria-hidden="true">/</span><strong>Contact</strong>
      </nav>
      <h1 className="page-title">Contact us</h1>
      <p className="lead">Visit our Colombo showroom, call, or message us on WhatsApp.</p>

      <div className="builder">
        <div className="card contact-links" style={{ flex: "1 1 360px", padding: 24, display: "grid", gap: 18, fontSize: 15, lineHeight: 1.6 }}>
          <div><div className="slot-label">Address</div>{site.address}</div>
          <div><div className="slot-label">Phone</div><a href={site.phoneHref}>{site.phone}</a></div>
          <div><div className="slot-label">WhatsApp</div><a href={whatsappLink()} target="_blank" rel="noopener noreferrer">{site.whatsapp}</a></div>
          <div><div className="slot-label">Email</div><a href={`mailto:${site.email}`}>{site.email}</a></div>
          <div>
            <div className="slot-label">Business hours</div>
            {site.hours.map((h) => <div key={h.days}>{h.days}: {h.time}</div>)}
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <a className="btn btn-primary" href={whatsappLink("Hi Newcom, ")} target="_blank" rel="noopener noreferrer">Message on WhatsApp</a>
            <a className="btn" href={site.phoneHref}>Call {site.phone}</a>
          </div>
        </div>
        <div className="card" style={{ flex: "1 1 480px", overflow: "hidden", minHeight: 380 }}>
          <iframe title={`${site.legalName} on Google Maps`} src={site.mapEmbed} style={{ border: 0, width: "100%", height: "100%", minHeight: 380 }} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
        </div>
      </div>
    </div>
  );
}

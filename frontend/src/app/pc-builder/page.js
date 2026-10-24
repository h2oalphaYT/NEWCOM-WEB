import Link from "next/link";
import PcBuilder from "@/components/PcBuilder";

export const metadata = { title: "Build your PC" };

export default function PcBuilderPage() {
  return (
    <div className="wrap">
      <nav aria-label="Breadcrumb" className="crumbs">
        <Link href="/">Home</Link><span aria-hidden="true">/</span><strong>PC builder</strong>
      </nav>
      <h1 className="page-title">Build your PC</h1>
      <p className="lead">
        Choose a part for each slot. Compatibility is checked on every change. Sample parts and prices for now;
        send the build to us on WhatsApp for a confirmed quotation.
      </p>
      <PcBuilder />
    </div>
  );
}

import Link from "next/link";
import PcBuilder from "@/components/PcBuilder";

export const metadata = { title: "Build your PC" };

export default function PcBuilderPage() {
  return (
    <div className="wrap">
      <nav aria-label="Breadcrumb" className="crumbs no-print">
        <Link href="/">Home</Link><span aria-hidden="true">/</span><strong>PC builder</strong>
      </nav>
      <div className="no-print">
        <h1 className="page-title">Build your PC</h1>
        <p className="lead">
          Start from a ready-made build or pick each part yourself. Every part is fitted into the case in 3D, and price,
          power draw and compatibility update as you go. Sample parts and prices for now.
        </p>
      </div>
      <PcBuilder />
    </div>
  );
}

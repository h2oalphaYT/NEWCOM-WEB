import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { searchSample } from "@/lib/sampleProducts";

export const metadata = { title: "Products" };

export default async function Products({ searchParams }) {
  const { q = "" } = await searchParams;
  const products = searchSample(q);

  return (
    <div className="wrap">
      <nav aria-label="Breadcrumb" className="crumbs">
        <Link href="/">Home</Link><span aria-hidden="true">/</span><strong>Products</strong>
      </nav>
      <h1 className="page-title">{q ? `Results for “${q}”` : "All products"}</h1>
      <p className="lead">{products.length} item{products.length === 1 ? "" : "s"}</p>

      {products.length === 0 ? (
        <div className="notice">No products match “{q}”. Try a model number or brand.</div>
      ) : (
        <div className="grid">{products.map((p) => <ProductCard key={p.id} p={p} />)}</div>
      )}
    </div>
  );
}

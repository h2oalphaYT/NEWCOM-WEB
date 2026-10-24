import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { getItems, toProduct } from "@/lib/api";

export const metadata = { title: "Products" };

const ROWS = 24;

export default async function Products({ searchParams }) {
  const { q = "", page = "1" } = await searchParams;
  const pageNo = Math.max(1, parseInt(page, 10) || 1);
  const res = await getItems({ q, page_no: pageNo, row_count: ROWS });
  const products = res.ok ? res.payload.map(toProduct) : [];
  const pages = res.ok ? Math.max(1, Math.ceil((res.count || 0) / ROWS)) : 1;
  const href = (p) => `/products?${new URLSearchParams({ ...(q && { q }), page: String(p) })}`;

  return (
    <div className="wrap">
      <nav aria-label="Breadcrumb" className="crumbs">
        <Link href="/">Home</Link><span aria-hidden="true">/</span><strong>Products</strong>
      </nav>
      <h1 className="page-title">{q ? `Results for “${q}”` : "All products"}</h1>
      {res.ok && <p className="lead">{res.count} item{res.count === 1 ? "" : "s"}</p>}

      {!res.ok ? (
        <div className="notice">We couldn&apos;t load products right now. ({res.message})</div>
      ) : products.length === 0 ? (
        <div className="notice">No products match “{q}”. Try a model number or brand.</div>
      ) : (
        <div className="grid">{products.map((p, i) => <ProductCard key={p.id ?? i} p={p} />)}</div>
      )}

      {pages > 1 && (
        <div style={{ marginTop: 32, display: "flex", gap: 10, justifyContent: "center" }}>
          {pageNo > 1 && <Link className="btn" href={href(pageNo - 1)}>Previous</Link>}
          <span className="btn" aria-current="page">Page {pageNo} of {pages}</span>
          {pageNo < pages && <Link className="btn" href={href(pageNo + 1)}>Next</Link>}
        </div>
      )}
    </div>
  );
}

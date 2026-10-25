import { notFound } from "next/navigation";
import ProductDetail from "@/components/ProductDetail";
import { getItem, toProduct } from "@/lib/api";
import { findProduct, products } from "@/lib/catalog";

export function generateStaticParams() {
  return products.map((p) => ({ id: p.id }));
}

// sample catalogue first, then the live inventory (item codes like ACC0001)
async function load(id) {
  const local = findProduct(id);
  if (local) return local;
  const res = await getItem(id);
  return res.ok ? toProduct(res.payload) : null;
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const p = await load(decodeURIComponent(id));
  return { title: p ? p.name : "Product not found" };
}

export default async function ProductPage({ params }) {
  const { id } = await params;
  const p = await load(decodeURIComponent(id));
  if (!p) notFound();
  return <ProductDetail p={p} />;
}

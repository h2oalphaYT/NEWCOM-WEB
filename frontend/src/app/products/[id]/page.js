import { notFound } from "next/navigation";
import ProductDetail from "@/components/ProductDetail";
import { findProduct, products } from "@/lib/catalog";

export function generateStaticParams() {
  return products.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const p = findProduct(decodeURIComponent(id));
  return { title: p ? p.name : "Product not found" };
}

export default async function ProductPage({ params }) {
  const { id } = await params;
  const p = findProduct(decodeURIComponent(id));
  if (!p) notFound();
  return <ProductDetail p={p} />;
}

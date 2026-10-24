import CategoryView from "@/components/CategoryView";

export const metadata = { title: "Products" };

export default async function Products({ searchParams }) {
  const { q = "", category = "" } = await searchParams;
  return <CategoryView q={q} category={category} />;
}

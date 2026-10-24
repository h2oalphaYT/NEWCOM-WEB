import CategoryView from "@/components/CategoryView";

export const metadata = { title: "Certified pre-owned" };

export default function PreOwned() {
  return <CategoryView condition="used" />;
}

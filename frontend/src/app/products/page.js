import CategoryView from "@/components/CategoryView";
import { getCategories, getItems, toProduct } from "@/lib/api";

export const metadata = { title: "Products" };

const ROWS = 60;
// inventory categories that are internal or test data, hidden from shoppers
const HIDDEN = /^(test|example|dummy|svc|general|repairs)\b/i;

// menu labels like "Graphics cards" -> the inventory category code ("GRAPHICS CARD" / "VGA")
const ALIASES = { "graphics cards": ["graphics card", "vga"], processors: ["processor"], "memory and storage": ["ram", "solid state drive"], monitors: ["monitor"], laptops: ["laptops"], peripherals: ["computer peripherals"], "ups and power backup": ["ups"], "desktop pcs": ["branded pc"], "sim racing": ["racing wheel"] };
// inventory categories are not always used consistently, so a menu category with no items
// falls back to a name search with this keyword
const KEYWORDS = { "graphics cards": "graphic", processors: "processor", "memory and storage": "ram", monitors: "monitor", laptops: "laptop", peripherals: "mouse", "ups and power backup": "ups", "desktop pcs": "desktop", "sim racing": "wheel", "power supplies": "power supply" };
function codeFor(name, cats) {
  const want = ALIASES[name.toLowerCase()] || [name.toLowerCase().replace(/s$/, "")];
  return cats.find((c) => want.some((w) => c.label.toLowerCase().startsWith(w)))?.value || "";
}

export default async function Products({ searchParams }) {
  const { q = "", category = "", cat = "", page = "1" } = await searchParams;
  const pageNo = Math.max(1, parseInt(page, 10) || 1);

  const catsRes = await getCategories();
  const cats = catsRes.ok ? catsRes.payload.filter((c) => !HIDDEN.test(c.label)) : [];
  const code = cat || (category ? codeFor(category, cats) : "");

  // live inventory first; the sample catalogue is used only when the API is unreachable
  let res = await getItems({ q: q || undefined, category: code || undefined, page_no: pageNo, row_count: ROWS });
  if (res.ok && !res.payload.length && category && !q) {
    const kw = KEYWORDS[category.toLowerCase()] || category.replace(/s$/i, "");
    res = await getItems({ q: kw, page_no: pageNo, row_count: ROWS });
  }
  if (res.ok) {
    const items = res.payload.map(toProduct);
    const label = cats.find((c) => c.value === code)?.label || category;
    return <CategoryView live items={items} q={q} category={label} livePage={pageNo} hasMore={!!res.has_more} cat={code} cats={cats} />;
  }
  return <CategoryView q={q} category={category} />;
}

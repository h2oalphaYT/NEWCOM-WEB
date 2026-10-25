// Read-only client for the Go API in ../backend (same database as Newcom Inventory).
// Every call degrades gracefully: if the API is down the site keeps using the sample catalogue.
export const API = process.env.NEWCOM_API_URL || "http://localhost:8090";
// Website content (banners, promotions, pre-built PCs, orders...) lives in this repo's backend. Point
// NEWCOM_API_URL and NEXT_PUBLIC_API_URL at the same backend so items, content and uploads match.
export const WEB_API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8090";

async function get(path, params = {}, revalidate = 60) {
  const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ""));
  const url = `${path.startsWith("/api/web/") ? WEB_API : API}${path}${qs.size ? `?${qs}` : ""}`;
  try {
    const res = await fetch(url, { next: { revalidate }, signal: AbortSignal.timeout(8000) });
    const body = await res.json();
    if (!res.ok || !body.success) return { ok: false, message: body.message || `HTTP ${res.status}` };
    return { ok: true, ...body };
  } catch {
    return { ok: false, message: "Inventory API is not reachable" };
  }
}

export const getItems = (params) => get("/api/items", params);
export const getItem = (id) => get(`/api/items/${encodeURIComponent(id)}`);
export const getCategories = () => get("/api/categories", {}, 600);

// Website content managed in /admin (NEWCOM_WEB database). Short cache so admin edits show quickly.
export const getBanners = (placement) => get("/api/web/banners", { placement }, 30);
export const getPromotions = () => get("/api/web/promotions", {}, 30);
export const getSettings = () => get("/api/web/settings", {}, 60);
export const getPrebuilts = () => get("/api/web/prebuilt", {}, 30);
export const getPrebuilt = (slug) => get(`/api/web/prebuilt/${encodeURIComponent(slug)}`, {}, 30);

// stored media is either a full URL, a site asset (/media, /brand), an admin upload or an inventory image
export const assetUrl = (u) => (!u ? undefined : /^https?:\/\//.test(u) || /^\/(media|brand)\//.test(u) ? u : `${u.startsWith("/uploads/") ? WEB_API : API}${u}`);

// --- map an inventory row to the product shape the UI uses ---

// real-photo fallback per product type, used when an item has no picture (or it fails to load)
const FALLBACKS = [
  [/graphic|vga|gpu|rtx|gtx|radeon/i, "gpu", "gpu"],
  [/laptop|notebook|macbook/i, "laptop", "laptop"],
  [/processor|cpu(?! cooler)|ryzen|core i\d/i, "cpu", "cpu"],
  [/\bram\b|memory|ddr[345]/i, "ram-ssd", "ram"],
  [/ssd|solid state|hard disk|hdd|storage|nvme/i, "memory", "ssd"],
  [/monitor|display|\btv\b/i, "monitor", "monitor"],
  [/casing|\bcase\b|chassis/i, "case", "case"],
  [/branded pc|desktop|server|pos system/i, "desktop", "case"],
  [/key ?board|mouse|headset|speaker|spk|microphone|racing|webcam|camera/i, "peripherals", "headset"],
  [/power supply|psu|ups|power bank|battery|adapter/i, "desktop", "psu"],
];
export function fallbackFor(text = "") {
  const hit = FALLBACKS.find(([re]) => re.test(text));
  return { img: `/media/cat/${hit ? hit[1] : "peripherals"}.webp`, kind: hit ? hit[2] : "case" };
}

const STOCK = { "In Stock": "in", "Low Stock": "in", "Out of Stock": "out" };

export function toProduct(row) {
  const name = (row.vcItemDescrition || row.OriginalDescription || "Unnamed item").trim();
  const special = Number(row.SpecialPrice) || 0;
  const selling = Number(row.SellingPrice) || 0;
  const onOffer = special > 0 && special < selling;
  const fb = fallbackFor(`${row.CategoryName} ${name}`);
  const qty = Number(row.StockQuantity) || 0;
  return {
    id: String(row.cItemCode || "").trim(),
    name,
    brand: (row.Brand || name.split(/\s+/)[0]).trim(),
    category: (row.CategoryName || "").trim(),
    categoryCode: (row.cCategoryCode || "").trim(),
    kind: fb.kind,
    price: onOffer ? special : selling,
    was: onOffer ? selling : undefined,
    badge: row.PromoBadge || (onOffer ? "Sale" : undefined) || (row.StockStatus === "Low Stock" ? "Low stock" : undefined),
    stock: STOCK[row.StockStatus] || (qty > 0 ? "in" : "request"),
    stockQty: qty,
    max: Math.max(1, Math.min(10, Math.floor(qty) || 1)),
    img: assetUrl(row.vcItemImage),
    fallbackImg: fb.img,
    description: row.MarkdownDescription || "",
    condition: "new",
    live: true,
    specs: [{ k: "Category", v: (row.CategoryName || "").trim() }, { k: "Item code", v: String(row.cItemCode || "").trim() }, { k: "Stock", v: row.StockStatus || "" }],
    branchStock: { Colombo: qty },
  };
}

// Read-only client for the Go API in ../backend (same database as Newcom Inventory).
const API = process.env.NEWCOM_API_URL || "http://localhost:8090";

async function get(path, params = {}) {
  const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined && v !== ""));
  const url = `${API}${path}${qs.size ? `?${qs}` : ""}`;
  try {
    const res = await fetch(url, { next: { revalidate: 60 } });
    const body = await res.json();
    if (!res.ok || !body.success) return { ok: false, message: body.message || `HTTP ${res.status}` };
    return { ok: true, ...body };
  } catch {
    return { ok: false, message: "Inventory API is not reachable" };
  }
}

export const getItems = (params) => get("/api/items", params);
export const getItem = (id) => get(`/api/items/${encodeURIComponent(id)}`);
export const getCategories = () => get("/api/categories");
export const getBrands = () => get("/api/brands");

// The inventory DB functions return their own column names; map the likely ones here.
// TODO: confirm against the live columns and drop the fallbacks.
const pick = (row, keys) => keys.map((k) => row?.[k]).find((v) => v !== undefined && v !== null && v !== "");

export function toProduct(row) {
  return {
    id: pick(row, ["cItemCode", "ItemCode", "code"]),
    name: pick(row, ["vcItemDescrition", "vcItemDescription", "ItemDescription", "name"]) || "Unnamed item",
    brand: pick(row, ["vcBrandName", "BrandName", "vcBrand"]),
    category: pick(row, ["vcCategoryName", "vcDescription", "CategoryName"]),
    price: Number(pick(row, ["nSellingPrice", "nRetailPrice", "SellingPrice", "nPrice"]) || 0),
    stock: Number(pick(row, ["nBalanceQuantity", "BalanceQuantity"]) || 0),
    image: pick(row, ["vcItemImage", "ItemImage"]),
  };
}

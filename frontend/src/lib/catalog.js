// Sample catalogue from the Newcom Redesign mockup. Replace with the inventory API once the UI is final.

export const icons = {
  gpu: "M3 8h18v8H3zM12 12a2 2 0 1 0 .01 0M3 18h6",
  cpu: "M7 7h10v10H7zM10 10h4v4h-4zM9 3v4M15 3v4M9 17v4M15 17v4M3 9h4M3 15h4M17 9h4M17 15h4",
  ssd: "M4 6c0-1 3.5-2 8-2s8 1 8 2-3.5 2-8 2-8-1-8-2zM4 6v12c0 1 3.5 2 8 2s8-1 8-2V6",
  lap: "M4 6h16v10H4zM2 19h20",
  mon: "M3 4h18v12H3zM9 20h6M12 16v4",
  pc: "M7 3h10v18H7zM10 7h4M12 17h.01",
};

export const brandAccent = {
  AMD: "#F97316", Intel: "#E31E24", NVIDIA: "#22C55E", ASUS: "#EF4444", MSI: "#DC2626", Gigabyte: "#F59E0B",
  Samsung: "#60A5FA", Kingston: "#EF4444", Corsair: "#FACC15", Logitech: "#22D3EE", HyperX: "#EF4444",
};

const p = (id, name, brand, category, kind, price, stock, extra = {}) => ({
  id, name, brand, category, kind, price, stock, max: 5,
  specs: [{ k: "Source", v: "Sample data" }, { k: "Warranty", v: "[from catalogue]" }],
  ...extra,
});
const gpu = (id, name, brand, chip, vram, price, stock, extra = {}) =>
  p(id, name, brand, "Graphics cards", "gpu", price, stock, { chip, vram, specs: [{ k: "Chipset", v: chip }, { k: "Memory", v: vram }, { k: "Source", v: "Sample data" }], ...extra });

export const products = [
  gpu("DUAL-RTX4060-O8G", "ASUS Dual GeForce RTX 4060 8GB GDDR6 Graphics Card", "ASUS", "RTX 4060", "8GB", 139900, "in", { badge: "Sample" }),
  gpu("RTX4060-VENTUS-2X", "MSI GeForce RTX 4060 Ventus 2X 8GB", "MSI", "RTX 4060", "8GB", 134500, "in"),
  gpu("GV-N406TGAMING-OC", "Gigabyte RTX 4060 Ti Gaming OC 8GB", "Gigabyte", "RTX 4060 Ti", "8GB", 168000, "request"),
  gpu("TUF-RTX4070S-12G", "ASUS TUF Gaming RTX 4070 SUPER 12GB", "ASUS", "RTX 4070", "12GB", 289000, "in"),
  gpu("RTX4070-GX-SLIM", "MSI GeForce RTX 4070 Gaming X Slim 12GB", "MSI", "RTX 4070", "12GB", 279500, "out"),
  gpu("GV-R76GAMING-OC", "Gigabyte Radeon RX 7600 Gaming OC 8GB", "Gigabyte", "RX 7600", "8GB", 112000, "in"),
  gpu("DUAL-RX7600-8G", "ASUS Dual Radeon RX 7600 8GB", "ASUS", "RX 7600", "8GB", 108500, "in"),
  gpu("RX7800XT-GAMING", "MSI Radeon RX 7800 XT Gaming 16GB", "MSI", "RX 7800 XT", "16GB", 245000, "in"),
  gpu("GV-N408SEAGLE", "Gigabyte RTX 4080 SUPER Eagle 16GB", "Gigabyte", "RTX 4080", "16GB", 395000, "request"),
  gpu("ROG-STRIX-4070TI", "ASUS ROG Strix RTX 4070 Ti 12GB", "ASUS", "RTX 4070 Ti", "12GB", 355000, "in"),
  p("100-100000593WOF", "AMD Ryzen 5 7600X 6-core AM5 Processor", "AMD", "Processors", "cpu", 89500, "in"),
  p("BX8071513400F", "Intel Core i5-13400F Processor", "Intel", "Processors", "cpu", 74900, "in"),
  p("MZ-V8P1T0BW", "Samsung 980 PRO 1TB PCIe 4.0 NVMe SSD", "Samsung", "Memory and storage", "ssd", 46900, "in", { was: 52000, badge: "Sale", max: 8 }),
  p("KF556C40BB-16", "Kingston Fury Beast 16GB DDR5-5600 Memory Kit", "Kingston", "Memory and storage", "ram", 24800, "in", { badge: "New", isNew: true }),
  p("GS27Q", "Gigabyte 27in 165Hz QHD IPS Gaming Monitor", "Gigabyte", "Monitors", "monitor", 94500, "request"),
  p("THIN-15-B12UC", "MSI Thin 15 Gaming Laptop, Core i5, 16GB, RTX 4050", "MSI", "Laptops", "laptop", 329000, "in", { badge: "New", isNew: true }),
  p("CLOUD-III-WL", "HyperX Cloud III Wireless Gaming Headset", "HyperX", "Peripherals", "headset", 49500, "in", { badge: "New", isNew: true }),
  p("G502X", "Logitech G502 X Wired Gaming Mouse", "Logitech", "Peripherals", "mouse", 21500, "in", { badge: "New", isNew: true }),
  p("CP-9020248", "Corsair RM750e 750W 80+ Gold PSU", "Corsair", "Power supplies", "psu", 58200, "out"),
];

export const bestSellers = ["DUAL-RTX4060-O8G", "100-100000593WOF", "MZ-V8P1T0BW", "GS27Q"];
export const newArrivals = ["THIN-15-B12UC", "KF556C40BB-16", "CLOUD-III-WL", "G502X"];

export const categories = [
  { n: "Laptops", s: "Gaming, business, student", d: icons.lap },
  { n: "Desktop PCs", s: "Ready builds and workstations", d: icons.pc },
  { n: "Graphics cards", s: "NVIDIA and AMD", d: icons.gpu },
  { n: "Processors", s: "Intel and AMD", d: icons.cpu },
  { n: "Memory and storage", s: "RAM, SSD, NVMe", d: icons.ssd },
  { n: "Monitors", s: "Size, refresh rate, panel", d: icons.mon },
];

export const findProduct = (id) => products.find((x) => x.id === id);
export const byIds = (ids) => ids.map(findProduct).filter(Boolean);
export const productHref = (id) => `/products/${encodeURIComponent(id)}`;
export const categoryHref = (c) => `/products?category=${encodeURIComponent(c)}`;

export const stockInfo = {
  in: ["In stock", "#15803D"],
  out: ["Out of stock", "#B91C1C"],
  request: ["Available on request", "#B45309"],
};

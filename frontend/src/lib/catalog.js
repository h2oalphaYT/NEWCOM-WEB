// Sample catalogue from the Newcom Redesign mockup. Replace with the inventory API once the UI is final.
import { partById } from "@/lib/builder";

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
  p("GS27Q", "Gigabyte 27in 165Hz QHD IPS Gaming Monitor", "Gigabyte", "Monitors", "monitor", 94500, "request", { size: "27in", refresh: "165Hz", panel: "IPS", res: "2560×1440" }),
  p("THIN-15-B12UC", "MSI Thin 15 Gaming Laptop, Core i5, 16GB, RTX 4050", "MSI", "Laptops", "laptop", 329000, "in", { badge: "New", isNew: true, cpuArch: "Intel", ramGB: 16, ramGen: "DDR4", gpuClass: "RTX 4050", screen: "15.6in", refresh: "144Hz", weight: "1.86kg" }),
  p("CLOUD-III-WL", "HyperX Cloud III Wireless Gaming Headset", "HyperX", "Peripherals", "headset", 49500, "in", { badge: "New", isNew: true }),
  p("G502X", "Logitech G502 X Wired Gaming Mouse", "Logitech", "Peripherals", "mouse", 21500, "in", { badge: "New", isNew: true }),
  p("CP-9020248", "Corsair RM750e 750W 80+ Gold PSU", "Corsair", "Power supplies", "psu", 58200, "out"),
];

const lap = (id, name, brand, price, stock, cpuArch, ramGB, ramGen, gpuClass, screen, extra = {}) =>
  p(id, name, brand, "Laptops", "laptop", price, stock, { cpuArch, ramGB, ramGen, gpuClass, screen, ...extra });
const mon = (id, name, brand, price, stock, size, refresh, panel, res) =>
  p(id, name, brand, "Monitors", "monitor", price, stock, { size, refresh, panel, res });

// laptops, monitors, specialist categories and certified pre-owned (sample data)
products.push(
  lap("FA507NV", "ASUS TUF Gaming A15, Ryzen 7 7735HS, 16GB, RTX 4060", "ASUS", 389000, "in", "AMD Ryzen", 16, "DDR5", "RTX 4060", "15.6in", { refresh: "144Hz", weight: "2.2kg" }),
  lap("A715-76G", "Acer Aspire 7, Core i5-12450H, 8GB, RTX 2050", "Acer", 239000, "in", "Intel", 8, "DDR4", "RTX 2050", "15.6in", { refresh: "144Hz", weight: "2.1kg" }),
  lap("INSP-14P", "Dell Inspiron 14 Plus, Core Ultra 7, 16GB", "Dell", 365000, "request", "Intel", 16, "DDR5", "Integrated", "14in", { refresh: "60Hz", weight: "1.6kg" }),
  lap("VICTUS-16", "HP Victus 16, Ryzen 5 8645HS, 16GB, RTX 4050", "HP", 309000, "in", "AMD Ryzen", 16, "DDR5", "RTX 4050", "16.1in", { refresh: "144Hz", weight: "2.3kg" }),
  lap("MBA-M3-13", "Apple MacBook Air 13in, M3, 16GB, 256GB", "Apple", 349000, "in", "Apple Silicon", 16, "Unified", "Integrated", "13.6in", { refresh: "60Hz", weight: "1.24kg" }),
  lap("S5507QA", "ASUS Vivobook S 15, Snapdragon X Elite, 16GB", "ASUS", 335000, "request", "Snapdragon X", 16, "LPDDR5X", "Integrated", "15.6in", { refresh: "120Hz", weight: "1.42kg" }),
  mon("VG249Q1A", "ASUS TUF VG249Q1A 24in 165Hz IPS Monitor", "ASUS", 52500, "in", "24in", "165Hz", "IPS", "1920×1080"),
  mon("S2722DC", "Dell S2722DC 27in QHD USB-C Monitor", "Dell", 98500, "in", "27in", "75Hz", "IPS", "2560×1440"),
  mon("MAG325CQRF", "MSI MAG 32in 170Hz Curved QHD Monitor", "MSI", 118000, "request", "32in", "170Hz", "Rapid VA", "2560×1440"),
  p("G923-PS", "Logitech G923 TRUEFORCE Racing Wheel and Pedals", "Logitech", "Sim racing", "case", 129000, "in"),
  p("NLR-GT-LITE", "Next Level Racing GTLite Foldable Cockpit", "Next Level Racing", "Sim racing", "case", 98000, "request"),
  p("CSL-PEDALS", "Fanatec CSL Pedals with Load Cell Kit", "Fanatec", "Sim racing", "case", 76500, "request"),
  p("HD60X", "Elgato HD60 X Capture Card", "Elgato", "Streaming and creator", "case", 58000, "in"),
  p("MV7PLUS", "Shure MV7+ Podcast Microphone", "Shure", "Streaming and creator", "headset", 92000, "request"),
  p("ARMOR-ONE", "Cougar Armor One Gaming Chair", "Cougar", "Chairs and desks", "case", 54000, "in"),
  p("FLEXI-E7", "FlexiSpot E7 Motorised Standing Desk", "FlexiSpot", "Chairs and desks", "case", 168000, "request"),
  p("BX1100", "APC Back-UPS BX1100 1100VA", "APC", "UPS and power backup", "psu", 38500, "in"),
  p("BR1500", "APC Back-UPS Pro 1500VA", "APC", "UPS and power backup", "psu", 96000, "request"),
  lap("USED-LAT7420", "Dell Latitude 7420, Core i7-1185G7, 16GB (certified pre-owned)", "Dell", 159000, "in", "Intel", 16, "DDR4", "Integrated", "14in", { condition: "used", grade: "A", usedWarranty: "6 months", badge: "Pre-owned" }),
  lap("USED-T14G2", "Lenovo ThinkPad T14 Gen 2, Ryzen 5 Pro, 16GB (certified pre-owned)", "Lenovo", 134000, "in", "AMD Ryzen", 16, "DDR4", "Integrated", "14in", { condition: "used", grade: "A-", usedWarranty: "6 months", badge: "Pre-owned" }),
  gpu("USED-3060-12G", "MSI GeForce RTX 3060 Ventus 2X 12GB (tested pre-owned)", "MSI", "RTX 3060", "12GB", 74500, "in", { condition: "used", grade: "B+", usedWarranty: "3 months", badge: "Pre-owned" }),
  p("USED-Z4G4", "HP Z4 G4 Workstation, Xeon W-2135, 32GB (certified pre-owned)", "HP", "Desktop PCs", "case", 189000, "request", { condition: "used", grade: "A", usedWarranty: "6 months", badge: "Pre-owned" }),
);

// stock per branch (sample). Only branches listed in site.branches are shown.
products.forEach((x, i) => {
  if (!x.condition) x.condition = "new";
  x.branchStock = { Colombo: x.stock === "in" ? 2 + (i % 5) : 0 };
});

export const bestSellers = ["DUAL-RTX4060-O8G", "100-100000593WOF", "MZ-V8P1T0BW", "GS27Q"];
export const newArrivals = ["THIN-15-B12UC", "KF556C40BB-16", "CLOUD-III-WL", "G502X"];

export const extraCategories = [
  { n: "Sim racing", s: "Wheels, pedals, cockpits" },
  { n: "Streaming and creator", s: "Capture cards, microphones" },
  { n: "Chairs and desks", s: "Gaming chairs, standing desks" },
  { n: "UPS and power backup", s: "Keep working through power cuts" },
];

export const categories = [
  { n: "Laptops", s: "Gaming, business, student", d: icons.lap },
  { n: "Desktop PCs", s: "Ready builds and workstations", d: icons.pc },
  { n: "Graphics cards", s: "NVIDIA and AMD", d: icons.gpu },
  { n: "Processors", s: "Intel and AMD", d: icons.cpu },
  { n: "Memory and storage", s: "RAM, SSD, NVMe", d: icons.ssd },
  { n: "Monitors", s: "Size, refresh rate, panel", d: icons.mon },
];

// PC builder parts can also go in the cart
const builderKind = { cpu: "cpu", gpu: "gpu", ram: "ram", ssd: "ssd", hdd: "ssd", xsto: "ssd", psu: "psu", cooler: "psu", fans: "psu", case: "case", mb: "case", rgb: "case", mon: "monitor", kbd: "keyboard", mouse: "mouse" };
const fromBuilder = (b) => b && { id: b.id, name: b.name, brand: b.name.split(" ")[0], category: "PC build parts", kind: builderKind[b.slot] || "case", price: b.price, stock: "in", max: 5, specs: [{ k: "Source", v: "PC builder sample" }] };

export const findProduct = (id) => products.find((x) => x.id === id) || fromBuilder(partById(id));
export const byIds = (ids) => ids.map(findProduct).filter(Boolean);
export const productHref = (id) => `/products/${encodeURIComponent(id)}`;
export const categoryHref = (c) => `/products?category=${encodeURIComponent(c)}`;

export const stockInfo = {
  in: ["In stock", "#15803D"],
  out: ["Out of stock", "#B91C1C"],
  request: ["Available on request", "#B45309"],
};

// --- installments (display only until KOKO / Mintpay merchant accounts are connected) ---
export const koko = (price) => Math.ceil(price / 3);
export const mintpay = (price) => Math.ceil(price / 3);

// --- filter facets per category ---
const facet = (title, get) => ({ title, get });
export function facetsFor(category) {
  if (category === "Laptops") return [
    facet("Brand", (x) => x.brand), facet("Processor", (x) => x.cpuArch), facet("RAM", (x) => x.ramGB && `${x.ramGB}GB ${x.ramGen}`),
    facet("Graphics", (x) => x.gpuClass), facet("Screen size", (x) => x.screen),
  ];
  if (category === "Monitors") return [facet("Brand", (x) => x.brand), facet("Size", (x) => x.size), facet("Refresh rate", (x) => x.refresh), facet("Panel", (x) => x.panel)];
  if (category === "Graphics cards") return [facet("Brand", (x) => x.brand), facet("GPU chipset", (x) => x.chip), facet("Memory", (x) => x.vram)];
  return [facet("Brand", (x) => x.brand), facet("Category", (x) => x.category)];
}

// --- comparison rows: every spec any of the compared products has ---
const SPEC_ROWS = [
  ["Price", (x) => x.price], ["Brand", (x) => x.brand], ["Category", (x) => x.category], ["Condition", (x) => (x.condition === "used" ? `Pre-owned, grade ${x.grade}` : "New")],
  ["Warranty", (x) => x.usedWarranty || "[from catalogue]"], ["Processor", (x) => x.cpuArch], ["RAM", (x) => x.ramGB && `${x.ramGB}GB ${x.ramGen}`],
  ["Graphics", (x) => x.gpuClass || x.chip], ["GPU memory", (x) => x.vram], ["Screen", (x) => x.screen || x.size], ["Refresh rate", (x) => x.refresh],
  ["Panel", (x) => x.panel], ["Resolution", (x) => x.res], ["Weight", (x) => x.weight], ["Availability", (x) => stockInfo[x.stock]?.[0]],
];
export function compareRows(items) {
  return SPEC_ROWS.map(([label, get]) => [label, items.map(get)]).filter(([, vals]) => vals.some((v) => v !== undefined && v !== null && v !== ""));
}

import { categories, extraCategories } from "@/lib/catalog";

// Category menu from the header mockup. Labels that match a catalogue category open it;
// the rest search the catalogue until the menu is driven by the inventory categories.
export const menus = [
  { label: "Laptops", cols: [{ title: "Type", links: ["Gaming laptops", "Business laptops", "Student laptops", "Creator laptops"] }, { title: "Brands", links: ["ASUS", "MSI", "Lenovo", "HP"] }] },
  { label: "Desktop PCs", cols: [{ title: "Ready builds", links: ["Gaming PCs", "Workstations", "Office PCs"] }, { title: "Custom", links: ["Build your PC"] }] },
  { label: "Components", cols: [{ title: "Core", links: ["Processors", "Graphics cards", "Motherboards", "Memory (RAM)"] }, { title: "Support", links: ["SSDs and storage", "Power supplies", "PC cases", "Coolers and fans"] }, { title: "Brands", links: ["AMD", "Intel", "NVIDIA", "Corsair"] }] },
  { label: "Monitors", cols: [{ title: "By use", links: ["Gaming monitors", "Office monitors", "Creator monitors"] }, { title: "By size", links: ["24 inch", "27 inch", "32 inch and above"] }] },
  { label: "Sim racing", cols: [{ title: "Sim racing", links: ["Sim racing"] }, { title: "Creators", links: ["Streaming and creator"] }] },
  { label: "Workspace", cols: [{ title: "Comfort", links: ["Chairs and desks"] }, { title: "Power", links: ["UPS and power backup"] }] },
  { label: "Peripherals", cols: [{ title: "Input", links: ["Keyboards", "Mice", "Controllers"] }, { title: "Audio", links: ["Headsets", "Speakers", "Microphones"] }] },
  { label: "Networking", cols: [{ title: "Devices", links: ["Routers", "Switches", "Wi-Fi adapters", "Cables"] }] },
];

const alias = { "Memory (RAM)": "Memory and storage", "SSDs and storage": "Memory and storage", "Power supplies": "Power supplies", Peripherals: "Peripherals" };
const known = new Set([...categories.map((c) => c.n), ...extraCategories.map((c) => c.n), "Peripherals", "Power supplies"]);

export function linkFor(label) {
  if (label === "Build your PC") return "/pc-builder";
  const cat = alias[label] || label;
  if (known.has(cat)) return `/products?category=${encodeURIComponent(cat)}`;
  return `/products?q=${encodeURIComponent(label)}`;
}

// Pictures for menu items, so shoppers can recognise a product type without knowing its name.
// img: photo in /public/media/cat, logo: brand mark key (see MenuThumb), kind: ProductArt fallback.
const photo = (n) => ({ img: `/media/cat/${n}-t.webp` });
const thumbs = {
  Laptops: photo("laptop"), "Gaming laptops": photo("laptop"), "Business laptops": photo("laptop"), "Student laptops": photo("laptop"), "Creator laptops": photo("laptop"),
  "Desktop PCs": photo("desktop"), "Gaming PCs": photo("desktop"), Workstations: photo("case"), "Office PCs": photo("case"), "Build your PC": photo("desktop"),
  Components: photo("gpu"), Processors: photo("cpu"), "Graphics cards": photo("gpu"), Motherboards: { kind: "case" }, "Memory (RAM)": photo("ram-ssd"),
  "SSDs and storage": photo("memory"), "Power supplies": { kind: "psu" }, "PC cases": photo("case"), "Coolers and fans": { kind: "psu" },
  Monitors: photo("monitor"), "Gaming monitors": photo("monitor"), "Office monitors": photo("monitor"), "Creator monitors": photo("monitor"),
  "24 inch": { size: 24 }, "27 inch": { size: 27 }, "32 inch and above": { size: 32 },
  Peripherals: photo("peripherals"), Keyboards: photo("peripherals"), Mice: photo("peripherals"), Controllers: { kind: "mouse" },
  Headsets: photo("peripherals"), Speakers: { kind: "headset" }, Microphones: { kind: "headset" },
  "Sim racing": { kind: "case" }, "Streaming and creator": { kind: "headset" }, Workspace: { kind: "case" },
  "Chairs and desks": { kind: "case" }, "UPS and power backup": { kind: "psu" },
  Networking: { kind: "ssd" }, Routers: { kind: "ssd" }, Switches: { kind: "ssd" }, "Wi-Fi adapters": { kind: "ssd" }, Cables: { kind: "psu" },
  ASUS: { logo: "asus" }, MSI: { logo: "msi" }, Lenovo: { logo: "lenovo" }, HP: { logo: "hp" },
  AMD: { logo: "amd" }, Intel: { logo: "intel" }, NVIDIA: { logo: "nvidia" }, Corsair: { logo: "corsair" },
};
export const thumbFor = (label) => thumbs[label] || { kind: "case" };
// large picture for the "Shop all" card in each dropdown
export const heroFor = (label) => thumbs[label]?.img?.replace("-t.webp", ".webp");

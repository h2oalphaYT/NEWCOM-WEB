import { categories } from "@/lib/catalog";

// Category menu from the header mockup. Labels that match a catalogue category open it;
// the rest search the catalogue until the menu is driven by the inventory categories.
export const menus = [
  { label: "Laptops", cols: [{ title: "Type", links: ["Gaming laptops", "Business laptops", "Student laptops", "Creator laptops"] }, { title: "Brands", links: ["ASUS", "MSI", "Lenovo", "HP"] }] },
  { label: "Desktop PCs", cols: [{ title: "Ready builds", links: ["Gaming PCs", "Workstations", "Office PCs"] }, { title: "Custom", links: ["Build your PC"] }] },
  { label: "Components", cols: [{ title: "Core", links: ["Processors", "Graphics cards", "Motherboards", "Memory (RAM)"] }, { title: "Support", links: ["SSDs and storage", "Power supplies", "PC cases", "Coolers and fans"] }, { title: "Brands", links: ["AMD", "Intel", "NVIDIA", "Corsair"] }] },
  { label: "Monitors", cols: [{ title: "By use", links: ["Gaming monitors", "Office monitors", "Creator monitors"] }, { title: "By size", links: ["24 inch", "27 inch", "32 inch and above"] }] },
  { label: "Peripherals", cols: [{ title: "Input", links: ["Keyboards", "Mice", "Controllers"] }, { title: "Audio", links: ["Headsets", "Speakers", "Microphones"] }] },
  { label: "Networking", cols: [{ title: "Devices", links: ["Routers", "Switches", "Wi-Fi adapters", "Cables"] }] },
  { label: "Software", cols: [{ title: "Licences", links: ["Operating systems", "Office suites", "Security"] }] },
];

const alias = { "Memory (RAM)": "Memory and storage", "SSDs and storage": "Memory and storage", "Power supplies": "Power supplies", Peripherals: "Peripherals" };
const known = new Set([...categories.map((c) => c.n), "Peripherals", "Power supplies"]);

export function linkFor(label) {
  if (label === "Build your PC") return "/pc-builder";
  const cat = alias[label] || label;
  if (known.has(cat)) return `/products?category=${encodeURIComponent(cat)}`;
  return `/products?q=${encodeURIComponent(label)}`;
}

// Category menu from the header mockup. Links go to the catalogue search until
// the menu is driven by the inventory categories (/api/categories).
export const menus = [
  { label: "Laptops", cols: [{ title: "Type", links: ["Gaming laptops", "Business laptops", "Student laptops", "Creator laptops"] }, { title: "Brands", links: ["ASUS", "MSI", "Lenovo", "HP"] }] },
  { label: "Desktop PCs", cols: [{ title: "Ready builds", links: ["Gaming PCs", "Workstations", "Office PCs"] }, { title: "Custom", links: ["Build your PC"] }] },
  { label: "Components", cols: [{ title: "Core", links: ["Processors", "Graphics cards", "Motherboards", "Memory (RAM)"] }, { title: "Support", links: ["SSDs and storage", "Power supplies", "PC cases", "Coolers and fans"] }, { title: "Brands", links: ["AMD", "Intel", "NVIDIA", "Corsair"] }] },
  { label: "Monitors", cols: [{ title: "By use", links: ["Gaming monitors", "Office monitors", "Creator monitors"] }, { title: "By size", links: ["24 inch", "27 inch", "32 inch and above"] }] },
  { label: "Peripherals", cols: [{ title: "Input", links: ["Keyboards", "Mice", "Controllers"] }, { title: "Audio", links: ["Headsets", "Speakers", "Microphones"] }] },
  { label: "Networking", cols: [{ title: "Devices", links: ["Routers", "Switches", "Wi-Fi adapters", "Cables"] }] },
  { label: "Software", cols: [{ title: "Licences", links: ["Operating systems", "Office suites", "Security"] }] },
];

export const linkFor = (label) =>
  label === "Build your PC" ? "/pc-builder" : `/products?q=${encodeURIComponent(label)}`;

// Sample catalogue from the header mockup, used while the UI is finalised.
// Swap for getItems() from ./api once the inventory API is connected.
export const sampleProducts = [
  { id: "DUAL-RTX4060-O8G", name: "ASUS Dual GeForce RTX 4060 8GB", brand: "ASUS", category: "Graphics cards", price: 139900, stock: 4 },
  { id: "100-100000593WOF", name: "AMD Ryzen 5 7600X Processor", brand: "AMD", category: "Processors", price: 89500, stock: 7 },
  { id: "MZ-V8P1T0BW", name: "Samsung 980 PRO 1TB NVMe SSD", brand: "Samsung", category: "SSDs and storage", price: 46900, stock: 12 },
  { id: "THIN-15-B12UC", name: "MSI Thin 15 Gaming Laptop", brand: "MSI", category: "Laptops", price: 329000, stock: 2 },
  { id: "GS27Q", name: "Gigabyte 27in 165Hz QHD Monitor", brand: "Gigabyte", category: "Monitors", price: 94500, stock: 3 },
  { id: "KF556C40BB-16", name: "Kingston Fury Beast 16GB DDR5 5600", brand: "Kingston", category: "Memory (RAM)", price: 24800, stock: 9 },
  { id: "BX8071513400F", name: "Intel Core i5-13400F Processor", brand: "Intel", category: "Processors", price: 74900, stock: 5 },
  { id: "CP-9020248", name: "Corsair RM750e 750W PSU", brand: "Corsair", category: "Power supplies", price: 58200, stock: 0 },
];

export function searchSample(q = "") {
  const n = q.trim().toLowerCase();
  if (!n) return sampleProducts;
  return sampleProducts.filter((p) => `${p.name} ${p.brand} ${p.id} ${p.category}`.toLowerCase().includes(n));
}

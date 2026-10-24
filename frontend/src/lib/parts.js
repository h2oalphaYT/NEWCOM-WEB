// Sample parts from the mockup. The compatibility rules need specs (socket, RAM type,
// lengths, wattage) that the inventory items do not carry yet, so the builder uses this list for now.
export const parts = {
  cpu: [
    { id: "c1", name: "AMD Ryzen 5 7600X", price: 89500, socket: "AM5", tdp: 105 },
    { id: "c2", name: "Intel Core i5-13400F", price: 74900, socket: "LGA1700", tdp: 65 },
    { id: "c3", name: "AMD Ryzen 7 7700X", price: 128000, socket: "AM5", tdp: 105 },
  ],
  mb: [
    { id: "m1", name: "ASUS TUF Gaming B650-PLUS", price: 86500, socket: "AM5", ram: "DDR5", form: "ATX" },
    { id: "m2", name: "MSI PRO B760M-A", price: 52000, socket: "LGA1700", ram: "DDR4", form: "mATX" },
    { id: "m3", name: "Gigabyte B650M DS3H", price: 59900, socket: "AM5", ram: "DDR5", form: "mATX" },
  ],
  ram: [
    { id: "r1", name: "Kingston Fury Beast 16GB DDR5-5600", price: 24800, ram: "DDR5" },
    { id: "r2", name: "Corsair Vengeance 16GB DDR4-3200", price: 19500, ram: "DDR4" },
  ],
  gpu: [
    { id: "g1", name: "ASUS Dual RTX 4060 8GB", price: 139900, len: 227, tdp: 115 },
    { id: "g2", name: "MSI RTX 4070 Gaming X Slim 12GB", price: 279500, len: 308, tdp: 200 },
    { id: "g3", name: "Gigabyte RTX 4080 SUPER Eagle 16GB", price: 395000, len: 340, tdp: 320 },
  ],
  sto: [
    { id: "s1", name: "Samsung 980 PRO 1TB NVMe", price: 46900, iface: "M.2 NVMe" },
    { id: "s2", name: "Crucial MX500 1TB SATA", price: 28500, iface: "SATA" },
  ],
  psu: [
    { id: "p1", name: "Corsair CV550 550W", price: 24500, w: 550 },
    { id: "p2", name: "Corsair RM750e 750W", price: 58200, w: 750 },
    { id: "p3", name: "Corsair RM1000e 1000W", price: 82000, w: 1000 },
  ],
  cas: [
    { id: "k1", name: "NZXT H510 Compact ATX", price: 34900, gpuMax: 381, cooler: 165, forms: ["ATX", "mATX"] },
    { id: "k2", name: "Cooler Master Q300L mATX", price: 21500, gpuMax: 360, cooler: 159, forms: ["mATX"] },
    { id: "k3", name: "Lian Li Lancool 216", price: 48900, gpuMax: 392, cooler: 180, forms: ["ATX", "mATX"] },
  ],
  col: [
    { id: "o1", name: "DeepCool AK400", price: 9800, sockets: ["AM5", "LGA1700"], h: 155 },
    { id: "o2", name: "Noctua NH-D15", price: 38900, sockets: ["AM5", "LGA1700"], h: 165 },
  ],
};

export const slotOrder = [
  ["cpu", "Processor"], ["mb", "Motherboard"], ["ram", "Memory"], ["gpu", "Graphics card"],
  ["sto", "Storage"], ["psu", "Power supply"], ["cas", "Case"], ["col", "CPU cooler"],
];

export const partMeta = {
  cpu: (p) => `${p.socket} · ${p.tdp}W`,
  mb: (p) => `${p.socket} · ${p.ram} · ${p.form}`,
  ram: (p) => p.ram,
  gpu: (p) => `${p.len}mm · ${p.tdp}W`,
  sto: (p) => p.iface,
  psu: (p) => `${p.w}W`,
  cas: (p) => `GPU up to ${p.gpuMax}mm · ${p.forms.join("/")}`,
  col: (p) => `${p.h}mm tall · ${p.sockets.join("/")}`,
};

const need = (...names) => `Select ${names.join(" and ")} to check.`;

export function estimateWatts({ cpu, gpu }) {
  return (cpu ? cpu.tdp : 0) + (gpu ? gpu.tdp : 0) + (cpu || gpu ? 100 : 0);
}

// Same rules as the mockup; each returns { t, s, st } with st in ok | bad | warn | pending.
export function compatibilityChecks(sel) {
  const { cpu, mb, ram, gpu, psu, cas, col, sto } = sel;
  const watts = estimateWatts(sel);
  return [
    !cpu || !mb ? { t: "CPU and motherboard socket", s: need("a processor", "a motherboard"), st: "pending" }
      : cpu.socket === mb.socket ? { t: "CPU and motherboard socket", s: `${cpu.socket} matches.`, st: "ok" }
      : { t: "CPU and motherboard socket", s: `CPU is ${cpu.socket} but the board is ${mb.socket}.`, st: "bad" },
    !ram || !mb ? { t: "Memory generation", s: need("memory", "a motherboard"), st: "pending" }
      : ram.ram === mb.ram ? { t: "Memory generation", s: `${ram.ram} is supported.`, st: "ok" }
      : { t: "Memory generation", s: `Board takes ${mb.ram} but the kit is ${ram.ram}.`, st: "bad" },
    !gpu || !cas ? { t: "GPU clearance", s: need("a graphics card", "a case"), st: "pending" }
      : gpu.len <= cas.gpuMax ? { t: "GPU clearance", s: `${gpu.len}mm card fits the ${cas.gpuMax}mm limit.`, st: "ok" }
      : { t: "GPU clearance", s: `Card is ${gpu.len}mm; the case allows ${cas.gpuMax}mm.`, st: "bad" },
    !mb || !cas ? { t: "Board size in case", s: need("a motherboard", "a case"), st: "pending" }
      : cas.forms.includes(mb.form) ? { t: "Board size in case", s: `${mb.form} is supported.`, st: "ok" }
      : { t: "Board size in case", s: `${mb.form} does not fit this case.`, st: "bad" },
    !psu || (!cpu && !gpu) ? { t: "Power supply", s: need("a power supply", "a CPU or GPU"), st: "pending" }
      : psu.w >= Math.ceil(watts * 1.4) ? { t: "Power supply", s: `About ${watts}W estimated draw; ${psu.w}W gives headroom.`, st: "ok" }
      : psu.w >= watts ? { t: "Power supply", s: `About ${watts}W estimated draw; ${psu.w}W leaves little headroom. Consider a larger unit.`, st: "warn" }
      : { t: "Power supply", s: `Estimated draw of ${watts}W exceeds ${psu.w}W.`, st: "bad" },
    !col || !cpu ? { t: "Cooler and CPU socket", s: need("a cooler", "a processor"), st: "pending" }
      : col.sockets.includes(cpu.socket) ? { t: "Cooler and CPU socket", s: `Mounting supports ${cpu.socket}.`, st: "ok" }
      : { t: "Cooler and CPU socket", s: `Cooler does not list ${cpu.socket}.`, st: "bad" },
    !col || !cas ? { t: "Cooler height in case", s: need("a cooler", "a case"), st: "pending" }
      : col.h <= cas.cooler ? { t: "Cooler height in case", s: `${col.h}mm fits the ${cas.cooler}mm limit.`, st: "ok" }
      : { t: "Cooler height in case", s: `Cooler is ${col.h}mm; case allows ${cas.cooler}mm.`, st: "bad" },
    !sto || !mb ? { t: "Storage interface", s: need("storage", "a motherboard"), st: "pending" }
      : { t: "Storage interface", s: `${sto.iface}: slot counts are not in the sample data, so this is not fully verified.`, st: "warn" },
  ];
}

// PC Builder v3 data and rules. Sample parts and prices until the inventory API supplies them.

export const ESSENTIALS = [
  ["case", "Casing"], ["mb", "Motherboard"], ["cpu", "Processor"], ["cooler", "CPU cooler"], ["ram", "Memory (RAM)"],
  ["ssd", "NVMe SSD"], ["gpu", "Graphics card"], ["hdd", "Hard drive"], ["psu", "Power supply"], ["fans", "Case fans"],
];
export const ACCESSORIES = [["xsto", "Extra storage"], ["rgb", "Lighting"], ["kbd", "Keyboard"], ["mouse", "Mouse"], ["mon", "Monitor"]];
export const ALL_SLOTS = [...ESSENTIALS, ...ACCESSORIES];
export const REQUIRED = ["case", "mb", "cpu", "cooler", "ram", "ssd", "psu"];

const P = (slot, id, name, price, spec = {}) => ({ slot, id, name, price, ...spec });

export const builderParts = [
  // processors
  P("cpu", "b-c-7600x", "AMD Ryzen 5 7600X", 89500, { platform: "amd", socket: "AM5", tdp: 105 }),
  P("cpu", "b-c-7800x3d", "AMD Ryzen 7 7800X3D", 168000, { platform: "amd", socket: "AM5", tdp: 120 }),
  P("cpu", "b-c-5600", "AMD Ryzen 5 5600", 42500, { platform: "amd", socket: "AM4", tdp: 65 }),
  P("cpu", "b-c-13400f", "Intel Core i5-13400F", 74900, { platform: "intel", socket: "LGA1700", tdp: 65 }),
  P("cpu", "b-c-14600k", "Intel Core i5-14600K", 112000, { platform: "intel", socket: "LGA1700", tdp: 125 }),
  P("cpu", "b-c-14700k", "Intel Core i7-14700K", 158000, { platform: "intel", socket: "LGA1700", tdp: 125 }),
  // motherboards
  P("mb", "b-m-b650", "ASUS TUF Gaming B650-PLUS", 86500, { platform: "amd", socket: "AM5", ram: "DDR5", form: "ATX", m2: 2 }),
  P("mb", "b-m-b650m", "Gigabyte B650M DS3H", 59900, { platform: "amd", socket: "AM5", ram: "DDR5", form: "mATX", m2: 2 }),
  P("mb", "b-m-b550", "MSI B550M PRO-VDH", 36500, { platform: "amd", socket: "AM4", ram: "DDR4", form: "mATX", m2: 2 }),
  P("mb", "b-m-b760m", "MSI PRO B760M-A DDR4", 52000, { platform: "intel", socket: "LGA1700", ram: "DDR4", form: "mATX", m2: 2 }),
  P("mb", "b-m-z790", "ASUS TUF Gaming Z790-PLUS", 118000, { platform: "intel", socket: "LGA1700", ram: "DDR5", form: "ATX", m2: 4 }),
  // coolers
  P("cooler", "b-o-ak400", "DeepCool AK400", 9800, { sockets: ["AM4", "AM5", "LGA1700"], h: 155, tdpMax: 220 }),
  P("cooler", "b-o-nhd15", "Noctua NH-D15", 38900, { sockets: ["AM4", "AM5", "LGA1700"], h: 165, tdpMax: 250 }),
  P("cooler", "b-o-ls720", "DeepCool LS720 360mm AIO", 42500, { sockets: ["AM4", "AM5", "LGA1700"], h: 55, tdpMax: 300, aio: true }),
  // memory
  P("ram", "b-r-ddr5-16", "Kingston Fury Beast 16GB (2×8) DDR5-5600", 24800, { ram: "DDR5", sticks: 2 }),
  P("ram", "b-r-ddr5-32", "Corsair Vengeance RGB 32GB (2×16) DDR5-6000", 46500, { ram: "DDR5", sticks: 2, rgb: true }),
  P("ram", "b-r-ddr4-16", "Corsair Vengeance LPX 16GB (2×8) DDR4-3200", 19500, { ram: "DDR4", sticks: 2 }),
  P("ram", "b-r-ddr4-32", "Kingston Fury Beast 32GB (2×16) DDR4-3200", 32500, { ram: "DDR4", sticks: 2 }),
  // nvme
  P("ssd", "b-s-980-1t", "Samsung 980 PRO 1TB NVMe", 46900, { iface: "M.2 NVMe" }),
  P("ssd", "b-s-sn770-1t", "WD Black SN770 1TB NVMe", 31500, { iface: "M.2 NVMe" }),
  P("ssd", "b-s-990-2t", "Samsung 990 PRO 2TB NVMe", 82000, { iface: "M.2 NVMe" }),
  // gpu
  P("gpu", "b-g-4060", "ASUS Dual RTX 4060 8GB", 139900, { len: 227, tdp: 115 }),
  P("gpu", "b-g-7600", "Gigabyte Radeon RX 7600 Gaming OC 8GB", 112000, { len: 282, tdp: 165 }),
  P("gpu", "b-g-4070s", "ASUS TUF RTX 4070 SUPER 12GB", 289000, { len: 301, tdp: 220 }),
  P("gpu", "b-g-4080s", "Gigabyte RTX 4080 SUPER Eagle 16GB", 395000, { len: 340, tdp: 320 }),
  // hdd
  P("hdd", "b-h-1t", "Seagate BarraCuda 1TB 7200rpm", 14500, { tdp: 7 }),
  P("hdd", "b-h-2t", "WD Blue 2TB 7200rpm", 21500, { tdp: 7 }),
  // psu
  P("psu", "b-p-550", "Corsair CV550 550W Bronze", 24500, { w: 550 }),
  P("psu", "b-p-750", "Corsair RM750e 750W Gold", 58200, { w: 750 }),
  P("psu", "b-p-850", "MSI MAG A850GL 850W Gold", 64500, { w: 850 }),
  P("psu", "b-p-1000", "Corsair RM1000e 1000W Gold", 82000, { w: 1000 }),
  // cases
  P("case", "b-k-h510", "NZXT H510 Compact ATX", 34900, { gpuMax: 381, cooler: 165, forms: ["ATX", "mATX"], rad: false, color: 0x141416 }),
  P("case", "b-k-q300l", "Cooler Master Q300L mATX", 21500, { gpuMax: 360, cooler: 159, forms: ["mATX"], rad: false, color: 0x101012 }),
  P("case", "b-k-216", "Lian Li Lancool 216", 48900, { gpuMax: 392, cooler: 180, forms: ["ATX", "mATX"], rad: true, color: 0x1a1a1e }),
  P("case", "b-k-o11w", "Lian Li O11 Dynamic EVO White", 62500, { gpuMax: 422, cooler: 167, forms: ["ATX", "mATX"], rad: true, color: 0xe8e8ec }),
  // fans
  P("fans", "b-f-3pk", "Arctic P12 PWM 3-pack", 9900, { count: 3, tdp: 6 }),
  P("fans", "b-f-3rgb", "Lian Li UNI FAN SL120 RGB 3-pack", 28500, { count: 3, tdp: 9, rgb: true }),
  // accessories
  P("xsto", "b-x-ext1t", "Samsung T7 1TB Portable SSD", 36500),
  P("rgb", "b-l-strip", "Corsair iCUE LS100 Lighting Strip Kit", 18500, { tdp: 5, rgb: true }),
  P("kbd", "b-kb-k70", "Corsair K70 RGB Mechanical Keyboard", 42000),
  P("mouse", "b-ms-g502", "Logitech G502 X Wired Gaming Mouse", 21500),
  P("mon", "b-mn-gs27q", "Gigabyte 27in 165Hz QHD Monitor", 94500),
];

export const partById = (id) => builderParts.find((p) => p.id === id);

export const templates = [
  { id: "starter", name: "Starter esports", tag: "Budget", note: "1080p esports and study", platform: "amd",
    parts: { case: "b-k-q300l", mb: "b-m-b550", cpu: "b-c-5600", cooler: "b-o-ak400", ram: "b-r-ddr4-16", ssd: "b-s-sn770-1t", gpu: "b-g-7600", psu: "b-p-550", fans: "b-f-3pk" } },
  { id: "mid", name: "1440p gamer", tag: "Mid range", note: "High refresh 1440p gaming", platform: "intel",
    parts: { case: "b-k-216", mb: "b-m-z790", cpu: "b-c-14600k", cooler: "b-o-ak400", ram: "b-r-ddr5-32", ssd: "b-s-980-1t", gpu: "b-g-4070s", psu: "b-p-750", fans: "b-f-3rgb" } },
  { id: "creator", name: "Creator workstation", tag: "Workstation", note: "Editing, 3D and streaming", platform: "intel",
    parts: { case: "b-k-o11w", mb: "b-m-z790", cpu: "b-c-14700k", cooler: "b-o-ls720", ram: "b-r-ddr5-32", ssd: "b-s-990-2t", hdd: "b-h-2t", gpu: "b-g-4080s", psu: "b-p-1000", fans: "b-f-3rgb", rgb: "b-l-strip" } },
  { id: "x3d", name: "Ultimate AMD gaming", tag: "High end", note: "Top frame rates at 4K", platform: "amd",
    parts: { case: "b-k-216", mb: "b-m-b650", cpu: "b-c-7800x3d", cooler: "b-o-ls720", ram: "b-r-ddr5-32", ssd: "b-s-990-2t", gpu: "b-g-4080s", psu: "b-p-850", fans: "b-f-3rgb" } },
];

export const metaFor = (p) => {
  switch (p.slot) {
    case "cpu": return `${p.socket} · ${p.tdp}W`;
    case "mb": return `${p.socket} · ${p.ram} · ${p.form} · ${p.m2}× M.2`;
    case "cooler": return `${p.aio ? "360mm AIO" : `${p.h}mm tall`} · up to ${p.tdpMax}W`;
    case "ram": return `${p.ram}${p.rgb ? " · RGB" : ""}`;
    case "ssd": return p.iface;
    case "gpu": return `${p.len}mm · ${p.tdp}W`;
    case "psu": return `${p.w}W`;
    case "case": return `GPU ≤ ${p.gpuMax}mm · ${p.forms.join("/")}${p.rad ? " · 360mm rad" : ""}`;
    case "fans": return `${p.count} fans${p.rgb ? " · RGB" : ""}`;
    default: return "Accessory";
  }
};

// options for a slot, filtered to the chosen platform where it matters
export function optionsFor(slot, platform) {
  return builderParts.filter((p) => p.slot === slot && (!p.platform || p.platform === platform));
}

export function estimateWatts(sel) {
  const parts = Object.values(sel).filter(Boolean);
  const sum = parts.reduce((a, p) => a + (p.slot === "psu" ? 0 : p.tdp || 0), 0);
  return parts.length ? sum + 75 : 0; // board, RAM, drives and USB allowance
}

export function compatibilityChecks(sel) {
  const { cpu, mb, ram, gpu, psu, case: cs, cooler } = sel;
  const watts = estimateWatts(sel);
  const need = (t, a, b) => ({ t, s: `Select ${a} and ${b} to check.`, st: "pending" });
  return [
    !cpu || !mb ? need("CPU and motherboard socket", "a processor", "a motherboard")
      : cpu.socket === mb.socket ? { t: "CPU and motherboard socket", s: `${cpu.socket} matches.`, st: "ok" }
      : { t: "CPU and motherboard socket", s: `CPU is ${cpu.socket} but the board is ${mb.socket}.`, st: "bad" },
    !ram || !mb ? need("Memory generation", "memory", "a motherboard")
      : ram.ram === mb.ram ? { t: "Memory generation", s: `${ram.ram} is supported.`, st: "ok" }
      : { t: "Memory generation", s: `Board takes ${mb.ram} but the kit is ${ram.ram}.`, st: "bad" },
    !mb || !cs ? need("Board size in case", "a motherboard", "a case")
      : cs.forms.includes(mb.form) ? { t: "Board size in case", s: `${mb.form} fits.`, st: "ok" }
      : { t: "Board size in case", s: `${mb.form} does not fit this case.`, st: "bad" },
    !gpu || !cs ? need("GPU clearance", "a graphics card", "a case")
      : gpu.len <= cs.gpuMax ? { t: "GPU clearance", s: `${gpu.len}mm card fits the ${cs.gpuMax}mm limit.`, st: "ok" }
      : { t: "GPU clearance", s: `Card is ${gpu.len}mm; the case allows ${cs.gpuMax}mm.`, st: "bad" },
    !cooler || !cpu ? need("Cooler fit and capacity", "a cooler", "a processor")
      : !cooler.sockets.includes(cpu.socket) ? { t: "Cooler fit and capacity", s: `Cooler does not list ${cpu.socket}.`, st: "bad" }
      : cooler.tdpMax < cpu.tdp ? { t: "Cooler fit and capacity", s: `Rated ${cooler.tdpMax}W, below the CPU's ${cpu.tdp}W.`, st: "warn" }
      : { t: "Cooler fit and capacity", s: `Mounts on ${cpu.socket} and handles ${cpu.tdp}W.`, st: "ok" },
    !cooler || !cs ? need("Cooler in case", "a cooler", "a case")
      : cooler.aio ? (cs.rad ? { t: "Cooler in case", s: "Case takes a 360mm radiator.", st: "ok" } : { t: "Cooler in case", s: "This case has no 360mm radiator mount.", st: "bad" })
      : cooler.h <= cs.cooler ? { t: "Cooler in case", s: `${cooler.h}mm fits the ${cs.cooler}mm limit.`, st: "ok" }
      : { t: "Cooler in case", s: `Cooler is ${cooler.h}mm; case allows ${cs.cooler}mm.`, st: "bad" },
    !psu || !watts ? need("Power supply headroom", "a power supply", "other parts")
      : psu.w >= Math.ceil(watts * 1.4) ? { t: "Power supply headroom", s: `About ${watts}W draw; ${psu.w}W gives good headroom.`, st: "ok" }
      : psu.w >= watts ? { t: "Power supply headroom", s: `About ${watts}W draw; ${psu.w}W leaves little headroom.`, st: "warn" }
      : { t: "Power supply headroom", s: `About ${watts}W draw exceeds ${psu.w}W.`, st: "bad" },
  ];
}

// share links: ?b=platform.id,id,id
export const encodeBuild = (platform, pick) => [platform, ...Object.values(pick).filter(Boolean)].join(".");
export function decodeBuild(code) {
  const [platform, ...ids] = String(code || "").split(".");
  if (platform !== "intel" && platform !== "amd") return null;
  const pick = {};
  ids.forEach((id) => { const p = partById(id); if (p) pick[p.slot] = id; });
  return { platform, pick };
}

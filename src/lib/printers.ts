// D-Calc — Printer Database

export interface PrinterModel {
  id: string;
  brand: string;
  model: string;
  fullName: string;
  price: number;           // Approximate price in EUR
  lifespanHours: number;   // Estimated lifespan in hours
  powerConsumptionWatts: number; // Average power consumption
  failureRate: number;     // Default failure rate percentage
  maintenancePerHour: number; // Maintenance cost per hour
  buildVolume: string;     // Build volume description
  type: 'fdm';            // Printer type
}

export const PRINTER_DATABASE: PrinterModel[] = [
  // ─── Artillery ───
  { id: 'artillery-x1', brand: 'Artillery', model: 'Genius X1', fullName: 'Artillery Genius X1', price: 250, lifespanHours: 4000, powerConsumptionWatts: 200, failureRate: 6, maintenancePerHour: 0.08, buildVolume: '220×220×250mm', type: 'fdm' },
  { id: 'artillery-sw-x3-plus', brand: 'Artillery', model: 'Sidewinder X3 Plus', fullName: 'Artillery Sidewinder X3 Plus', price: 380, lifespanHours: 4500, powerConsumptionWatts: 350, failureRate: 5, maintenancePerHour: 0.10, buildVolume: '300×300×400mm', type: 'fdm' },
  { id: 'artillery-sw-x4-plus', brand: 'Artillery', model: 'Sidewinder X4 Plus', fullName: 'Artillery Sidewinder X4 Plus', price: 450, lifespanHours: 5000, powerConsumptionWatts: 350, failureRate: 4, maintenancePerHour: 0.10, buildVolume: '300×300×400mm', type: 'fdm' },
  { id: 'artillery-genius-pro', brand: 'Artillery', model: 'Genius Pro', fullName: 'Artillery Genius Pro', price: 300, lifespanHours: 4500, powerConsumptionWatts: 200, failureRate: 5, maintenancePerHour: 0.08, buildVolume: '220×220×250mm', type: 'fdm' },
  { id: 'artillery-hornet', brand: 'Artillery', model: 'Hornet', fullName: 'Artillery Hornet', price: 200, lifespanHours: 3500, powerConsumptionWatts: 180, failureRate: 7, maintenancePerHour: 0.07, buildVolume: '220×220×250mm', type: 'fdm' },

  // ─── Anycubic ───
  { id: 'anycubic-kobra-x', brand: 'Anycubic', model: 'Kobra X', fullName: 'Anycubic Kobra X', price: 350, lifespanHours: 4500, powerConsumptionWatts: 250, failureRate: 5, maintenancePerHour: 0.09, buildVolume: '300×300×340mm', type: 'fdm' },
  { id: 'anycubic-kobra-2', brand: 'Anycubic', model: 'Kobra 2', fullName: 'Anycubic Kobra 2', price: 250, lifespanHours: 4000, powerConsumptionWatts: 200, failureRate: 5, maintenancePerHour: 0.08, buildVolume: '220×220×250mm', type: 'fdm' },
  { id: 'anycubic-kobra-2-max', brand: 'Anycubic', model: 'Kobra 2 Max', fullName: 'Anycubic Kobra 2 Max', price: 450, lifespanHours: 5000, powerConsumptionWatts: 400, failureRate: 5, maintenancePerHour: 0.12, buildVolume: '420×420×500mm', type: 'fdm' },
  { id: 'anycubic-kobra-2-pro', brand: 'Anycubic', model: 'Kobra 2 Pro', fullName: 'Anycubic Kobra 2 Pro', price: 320, lifespanHours: 4500, powerConsumptionWatts: 240, failureRate: 4, maintenancePerHour: 0.09, buildVolume: '240×240×270mm', type: 'fdm' },
  { id: 'anycubic-kobra-3', brand: 'Anycubic', model: 'Kobra 3', fullName: 'Anycubic Kobra 3', price: 350, lifespanHours: 5000, powerConsumptionWatts: 260, failureRate: 4, maintenancePerHour: 0.09, buildVolume: '250×250×260mm', type: 'fdm' },
  { id: 'anycubic-mega-s', brand: 'Anycubic', model: 'Mega S', fullName: 'Anycubic i3 Mega S', price: 200, lifespanHours: 3500, powerConsumptionWatts: 180, failureRate: 7, maintenancePerHour: 0.07, buildVolume: '210×210×205mm', type: 'fdm' },
  { id: 'anycubic-vyper', brand: 'Anycubic', model: 'Vyper', fullName: 'Anycubic Vyper', price: 280, lifespanHours: 4000, powerConsumptionWatts: 240, failureRate: 5, maintenancePerHour: 0.08, buildVolume: '245×245×260mm', type: 'fdm' },

  // ─── Bambu Lab ───
  { id: 'bambu-a1', brand: 'Bambu Lab', model: 'A1', fullName: 'Bambu Lab A1', price: 300, lifespanHours: 5000, powerConsumptionWatts: 150, failureRate: 3, maintenancePerHour: 0.06, buildVolume: '256×256×256mm', type: 'fdm' },
  { id: 'bambu-a1-ams', brand: 'Bambu Lab', model: 'A1 + AMS Lite', fullName: 'Bambu Lab A1 + AMS Lite', price: 450, lifespanHours: 5000, powerConsumptionWatts: 180, failureRate: 3, maintenancePerHour: 0.07, buildVolume: '256×256×256mm', type: 'fdm' },
  { id: 'bambu-a1-mini', brand: 'Bambu Lab', model: 'A1 Mini', fullName: 'Bambu Lab A1 Mini', price: 200, lifespanHours: 4500, powerConsumptionWatts: 100, failureRate: 3, maintenancePerHour: 0.05, buildVolume: '180×180×180mm', type: 'fdm' },
  { id: 'bambu-p1s', brand: 'Bambu Lab', model: 'P1S', fullName: 'Bambu Lab P1S', price: 600, lifespanHours: 6000, powerConsumptionWatts: 200, failureRate: 2, maintenancePerHour: 0.08, buildVolume: '256×256×256mm', type: 'fdm' },
  { id: 'bambu-p1p', brand: 'Bambu Lab', model: 'P1P', fullName: 'Bambu Lab P1P', price: 500, lifespanHours: 5500, powerConsumptionWatts: 200, failureRate: 3, maintenancePerHour: 0.08, buildVolume: '256×256×256mm', type: 'fdm' },
  { id: 'bambu-x1c', brand: 'Bambu Lab', model: 'X1-Carbon', fullName: 'Bambu Lab X1-Carbon', price: 1100, lifespanHours: 7000, powerConsumptionWatts: 250, failureRate: 2, maintenancePerHour: 0.10, buildVolume: '256×256×256mm', type: 'fdm' },
  { id: 'bambu-x1e', brand: 'Bambu Lab', model: 'X1E', fullName: 'Bambu Lab X1E', price: 1400, lifespanHours: 7000, powerConsumptionWatts: 280, failureRate: 1.5, maintenancePerHour: 0.11, buildVolume: '256×256×256mm', type: 'fdm' },

  // ─── Creality ───
  { id: 'creality-ender-3', brand: 'Creality', model: 'Ender 3', fullName: 'Creality Ender 3', price: 180, lifespanHours: 3500, powerConsumptionWatts: 270, failureRate: 8, maintenancePerHour: 0.07, buildVolume: '220×220×250mm', type: 'fdm' },
  { id: 'creality-ender-3-v2', brand: 'Creality', model: 'Ender 3 V2', fullName: 'Creality Ender 3 V2', price: 220, lifespanHours: 4000, powerConsumptionWatts: 270, failureRate: 7, maintenancePerHour: 0.07, buildVolume: '220×220×250mm', type: 'fdm' },
  { id: 'creality-ender-3-v3', brand: 'Creality', model: 'Ender 3 V3', fullName: 'Creality Ender 3 V3', price: 280, lifespanHours: 4500, powerConsumptionWatts: 270, failureRate: 5, maintenancePerHour: 0.08, buildVolume: '220×220×250mm', type: 'fdm' },
  { id: 'creality-ender-3-v3-se', brand: 'Creality', model: 'Ender 3 V3 SE', fullName: 'Creality Ender 3 V3 SE', price: 200, lifespanHours: 4000, powerConsumptionWatts: 270, failureRate: 6, maintenancePerHour: 0.07, buildVolume: '220×220×250mm', type: 'fdm' },
  { id: 'creality-ender-3-v3-ke', brand: 'Creality', model: 'Ender 3 V3 KE', fullName: 'Creality Ender 3 V3 KE', price: 300, lifespanHours: 4500, powerConsumptionWatts: 300, failureRate: 5, maintenancePerHour: 0.08, buildVolume: '220×220×240mm', type: 'fdm' },
  { id: 'creality-ender-5-s1', brand: 'Creality', model: 'Ender 5 S1', fullName: 'Creality Ender 5 S1', price: 350, lifespanHours: 4500, powerConsumptionWatts: 300, failureRate: 5, maintenancePerHour: 0.09, buildVolume: '220×220×280mm', type: 'fdm' },
  { id: 'creality-cr-10-se', brand: 'Creality', model: 'CR-10 SE', fullName: 'Creality CR-10 SE', price: 350, lifespanHours: 4500, powerConsumptionWatts: 300, failureRate: 5, maintenancePerHour: 0.09, buildVolume: '300×300×400mm', type: 'fdm' },
  { id: 'creality-cr10-smart-pro', brand: 'Creality', model: 'CR-10 Smart Pro', fullName: 'Creality CR-10 Smart Pro', price: 400, lifespanHours: 4500, powerConsumptionWatts: 350, failureRate: 5, maintenancePerHour: 0.10, buildVolume: '300×300×400mm', type: 'fdm' },
  { id: 'creality-k1', brand: 'Creality', model: 'K1', fullName: 'Creality K1', price: 350, lifespanHours: 5000, powerConsumptionWatts: 300, failureRate: 4, maintenancePerHour: 0.08, buildVolume: '220×220×250mm', type: 'fdm' },
  { id: 'creality-k1-max', brand: 'Creality', model: 'K1 Max', fullName: 'Creality K1 Max', price: 600, lifespanHours: 5500, powerConsumptionWatts: 400, failureRate: 4, maintenancePerHour: 0.10, buildVolume: '300×300×300mm', type: 'fdm' },
  { id: 'creality-k1c', brand: 'Creality', model: 'K1C', fullName: 'Creality K1C', price: 400, lifespanHours: 5000, powerConsumptionWatts: 300, failureRate: 4, maintenancePerHour: 0.09, buildVolume: '220×220×250mm', type: 'fdm' },
  { id: 'creality-sermoon-v1', brand: 'Creality', model: 'Sermoon V1', fullName: 'Creality Sermoon V1', price: 300, lifespanHours: 4000, powerConsumptionWatts: 200, failureRate: 6, maintenancePerHour: 0.08, buildVolume: '175×175×165mm', type: 'fdm' },

  // ─── Prusa ───
  { id: 'prusa-mk4', brand: 'Prusa', model: 'i3 MK4', fullName: 'Prusa i3 MK4', price: 800, lifespanHours: 7000, powerConsumptionWatts: 160, failureRate: 2, maintenancePerHour: 0.05, buildVolume: '250×210×220mm', type: 'fdm' },
  { id: 'prusa-mk4s', brand: 'Prusa', model: 'i3 MK4S', fullName: 'Prusa i3 MK4S', price: 900, lifespanHours: 7500, powerConsumptionWatts: 160, failureRate: 1.5, maintenancePerHour: 0.05, buildVolume: '250×210×220mm', type: 'fdm' },
  { id: 'prusa-mk3s', brand: 'Prusa', model: 'i3 MK3S+', fullName: 'Prusa i3 MK3S+', price: 650, lifespanHours: 6500, powerConsumptionWatts: 150, failureRate: 2.5, maintenancePerHour: 0.05, buildVolume: '250×210×210mm', type: 'fdm' },
  { id: 'prusa-mini', brand: 'Prusa', model: 'Mini+', fullName: 'Prusa Mini+', price: 450, lifespanHours: 5500, powerConsumptionWatts: 100, failureRate: 3, maintenancePerHour: 0.04, buildVolume: '180×180×180mm', type: 'fdm' },
  { id: 'prusa-xl', brand: 'Prusa', model: 'XL', fullName: 'Prusa XL', price: 2000, lifespanHours: 8000, powerConsumptionWatts: 350, failureRate: 1.5, maintenancePerHour: 0.12, buildVolume: '360×360×360mm', type: 'fdm' },
  { id: 'prusa-core-one', brand: 'Prusa', model: 'Core One', fullName: 'Prusa Core One', price: 800, lifespanHours: 7000, powerConsumptionWatts: 180, failureRate: 2, maintenancePerHour: 0.06, buildVolume: '250×220×270mm', type: 'fdm' },

  // ─── Elegoo ───
  { id: 'elegoo-neptune-4', brand: 'Elegoo', model: 'Neptune 4', fullName: 'Elegoo Neptune 4', price: 200, lifespanHours: 4000, powerConsumptionWatts: 250, failureRate: 6, maintenancePerHour: 0.07, buildVolume: '225×225×265mm', type: 'fdm' },
  { id: 'elegoo-neptune-4-pro', brand: 'Elegoo', model: 'Neptune 4 Pro', fullName: 'Elegoo Neptune 4 Pro', price: 280, lifespanHours: 4500, powerConsumptionWatts: 280, failureRate: 5, maintenancePerHour: 0.08, buildVolume: '225×225×265mm', type: 'fdm' },
  { id: 'elegoo-neptune-4-plus', brand: 'Elegoo', model: 'Neptune 4 Plus', fullName: 'Elegoo Neptune 4 Plus', price: 350, lifespanHours: 4500, powerConsumptionWatts: 350, failureRate: 5, maintenancePerHour: 0.09, buildVolume: '320×320×385mm', type: 'fdm' },
  { id: 'elegoo-neptune-4-max', brand: 'Elegoo', model: 'Neptune 4 Max', fullName: 'Elegoo Neptune 4 Max', price: 450, lifespanHours: 5000, powerConsumptionWatts: 400, failureRate: 5, maintenancePerHour: 0.10, buildVolume: '420×420×480mm', type: 'fdm' },
  { id: 'elegoo-OrangeStorm', brand: 'Elegoo', model: 'OrangeStorm Giga', fullName: 'Elegoo OrangeStorm Giga', price: 600, lifespanHours: 5000, powerConsumptionWatts: 500, failureRate: 4, maintenancePerHour: 0.12, buildVolume: '800×800×1000mm', type: 'fdm' },

  // ─── QIDI ───
  { id: 'qidi-x-max-3', brand: 'QIDI', model: 'X-Max 3', fullName: 'QIDI Tech X-Max 3', price: 700, lifespanHours: 5500, powerConsumptionWatts: 350, failureRate: 3, maintenancePerHour: 0.10, buildVolume: '325×325×315mm', type: 'fdm' },
  { id: 'qidi-x-plus-3', brand: 'QIDI', model: 'X-Plus 3', fullName: 'QIDI Tech X-Plus 3', price: 500, lifespanHours: 5000, powerConsumptionWatts: 280, failureRate: 3, maintenancePerHour: 0.09, buildVolume: '280×280×270mm', type: 'fdm' },
  { id: 'qidi-x-smart-3', brand: 'QIDI', model: 'X-Smart 3', fullName: 'QIDI Tech X-Smart 3', price: 350, lifespanHours: 4500, powerConsumptionWatts: 200, failureRate: 4, maintenancePerHour: 0.07, buildVolume: '180×180×170mm', type: 'fdm' },
  { id: 'qidi-q1-pro', brand: 'QIDI', model: 'Q1 Pro', fullName: 'QIDI Tech Q1 Pro', price: 550, lifespanHours: 5500, powerConsumptionWatts: 300, failureRate: 3, maintenancePerHour: 0.09, buildVolume: '280×280×280mm', type: 'fdm' },

  // ─── Voron ───
  { id: 'voron-0.2', brand: 'Voron', model: '0.2', fullName: 'Voron 0.2 (Kit)', price: 400, lifespanHours: 7000, powerConsumptionWatts: 150, failureRate: 2, maintenancePerHour: 0.05, buildVolume: '120×120×120mm', type: 'fdm' },
  { id: 'voron-2.4', brand: 'Voron', model: '2.4', fullName: 'Voron 2.4 (Kit)', price: 800, lifespanHours: 8000, powerConsumptionWatts: 300, failureRate: 1.5, maintenancePerHour: 0.06, buildVolume: '350×350×340mm', type: 'fdm' },
  { id: 'voron-trident', brand: 'Voron', model: 'Trident', fullName: 'Voron Trident (Kit)', price: 600, lifespanHours: 7500, powerConsumptionWatts: 250, failureRate: 1.5, maintenancePerHour: 0.06, buildVolume: '300×300×250mm', type: 'fdm' },
  { id: 'voron-switchwire', brand: 'Voron', model: 'Switchwire', fullName: 'Voron Switchwire (Kit)', price: 500, lifespanHours: 6000, powerConsumptionWatts: 300, failureRate: 2.5, maintenancePerHour: 0.07, buildVolume: '250×210×220mm', type: 'fdm' },

  // ─── Sovol ───
  { id: 'sovol-sv07', brand: 'Sovol', model: 'SV07', fullName: 'Sovol SV07', price: 250, lifespanHours: 4000, powerConsumptionWatts: 300, failureRate: 6, maintenancePerHour: 0.07, buildVolume: '220×220×250mm', type: 'fdm' },
  { id: 'sovol-sv07-plus', brand: 'Sovol', model: 'SV07 Plus', fullName: 'Sovol SV07 Plus', price: 380, lifespanHours: 4500, powerConsumptionWatts: 350, failureRate: 5, maintenancePerHour: 0.09, buildVolume: '300×300×400mm', type: 'fdm' },
  { id: 'sovol-sv08', brand: 'Sovol', model: 'SV08', fullName: 'Sovol SV08', price: 400, lifespanHours: 5000, powerConsumptionWatts: 350, failureRate: 5, maintenancePerHour: 0.09, buildVolume: '350×350×400mm', type: 'fdm' },

  // ─── Flashforge ───
  { id: 'flashforge-adventurer-5m', brand: 'Flashforge', model: 'Adventurer 5M', fullName: 'Flashforge Adventurer 5M', price: 300, lifespanHours: 4500, powerConsumptionWatts: 200, failureRate: 4, maintenancePerHour: 0.07, buildVolume: '220×220×220mm', type: 'fdm' },
  { id: 'flashforge-adventurer-5m-pro', brand: 'Flashforge', model: 'Adventurer 5M Pro', fullName: 'Flashforge Adventurer 5M Pro', price: 450, lifespanHours: 5000, powerConsumptionWatts: 250, failureRate: 3, maintenancePerHour: 0.08, buildVolume: '220×220×220mm', type: 'fdm' },
  { id: 'flashforge-creator-4', brand: 'Flashforge', model: 'Creator 4', fullName: 'Flashforge Creator 4', price: 1500, lifespanHours: 6000, powerConsumptionWatts: 400, failureRate: 3, maintenancePerHour: 0.12, buildVolume: '400×350×400mm', type: 'fdm' },

  // ─── Raise3D ───
  { id: 'raise3d-pro3', brand: 'Raise3D', model: 'Pro3', fullName: 'Raise3D Pro3', price: 1200, lifespanHours: 7000, powerConsumptionWatts: 350, failureRate: 2, maintenancePerHour: 0.10, buildVolume: '300×300×300mm', type: 'fdm' },
  { id: 'raise3d-pro3-plus', brand: 'Raise3D', model: 'Pro3 Plus', fullName: 'Raise3D Pro3 Plus', price: 1600, lifespanHours: 7500, powerConsumptionWatts: 400, failureRate: 2, maintenancePerHour: 0.12, buildVolume: '300×300×605mm', type: 'fdm' },
  { id: 'raise3d-e2cf', brand: 'Raise3D', model: 'E2CF', fullName: 'Raise3D E2CF', price: 900, lifespanHours: 6000, powerConsumptionWatts: 250, failureRate: 3, maintenancePerHour: 0.08, buildVolume: '330×240×240mm', type: 'fdm' },

  // ─── Ultimaker ───
  { id: 'ultimaker-s3', brand: 'Ultimaker', model: 'S3', fullName: 'Ultimaker S3', price: 3500, lifespanHours: 8000, powerConsumptionWatts: 200, failureRate: 1.5, maintenancePerHour: 0.08, buildVolume: '230×190×200mm', type: 'fdm' },
  { id: 'ultimaker-s5', brand: 'Ultimaker', model: 'S5', fullName: 'Ultimaker S5', price: 5500, lifespanHours: 9000, powerConsumptionWatts: 250, failureRate: 1, maintenancePerHour: 0.10, buildVolume: '330×240×300mm', type: 'fdm' },
  { id: 'ultimaker-s7', brand: 'Ultimaker', model: 'S7', fullName: 'Ultimaker S7', price: 6000, lifespanHours: 10000, powerConsumptionWatts: 280, failureRate: 1, maintenancePerHour: 0.10, buildVolume: '330×240×300mm', type: 'fdm' },

  // ─── FLSun ───
  { id: 'flsun-s1', brand: 'FLSUN', model: 'S1', fullName: 'FLSUN S1', price: 500, lifespanHours: 4500, powerConsumptionWatts: 350, failureRate: 4, maintenancePerHour: 0.09, buildVolume: '320×320×430mm', type: 'fdm' },
  { id: 'flsun-t1', brand: 'FLSUN', model: 'T1', fullName: 'FLSUN T1', price: 300, lifespanHours: 4000, powerConsumptionWatts: 300, failureRate: 5, maintenancePerHour: 0.08, buildVolume: '260×260×330mm', type: 'fdm' },
  { id: 'flsun-v400', brand: 'FLSUN', model: 'V400', fullName: 'FLSUN V400', price: 450, lifespanHours: 4000, powerConsumptionWatts: 350, failureRate: 5, maintenancePerHour: 0.09, buildVolume: '300×300×410mm', type: 'fdm' },

  // ─── Ratrig ───
  { id: 'ratrig-v-core-4', brand: 'RatRig', model: 'V-Core 4', fullName: 'RatRig V-Core 4 (Kit)', price: 800, lifespanHours: 7500, powerConsumptionWatts: 300, failureRate: 2, maintenancePerHour: 0.06, buildVolume: '300×300×300mm', type: 'fdm' },
  { id: 'ratrig-v-minion', brand: 'RatRig', model: 'V-Minion', fullName: 'RatRig V-Minion (Kit)', price: 400, lifespanHours: 6000, powerConsumptionWatts: 200, failureRate: 2.5, maintenancePerHour: 0.05, buildVolume: '180×180×180mm', type: 'fdm' },

  // ─── Tronxy ───
  { id: 'tronxy-x5sa', brand: 'Tronxy', model: 'X5SA', fullName: 'Tronxy X5SA', price: 250, lifespanHours: 3500, powerConsumptionWatts: 300, failureRate: 8, maintenancePerHour: 0.08, buildVolume: '330×330×400mm', type: 'fdm' },
  { id: 'tronxy-veho-600', brand: 'Tronxy', model: 'Veho 600', fullName: 'Tronxy Veho 600', price: 500, lifespanHours: 4500, powerConsumptionWatts: 400, failureRate: 6, maintenancePerHour: 0.10, buildVolume: '600×600×600mm', type: 'fdm' },
];

// Group printers by brand for the selector
export function getPrintersByBrand(): Record<string, PrinterModel[]> {
  const grouped: Record<string, PrinterModel[]> = {};
  for (const printer of PRINTER_DATABASE) {
    if (!grouped[printer.brand]) grouped[printer.brand] = [];
    grouped[printer.brand].push(printer);
  }
  // Sort brands alphabetically
  const sorted: Record<string, PrinterModel[]> = {};
  for (const brand of Object.keys(grouped).sort()) {
    sorted[brand] = grouped[brand];
  }
  return sorted;
}

// Find printer by id
export function getPrinterById(id: string): PrinterModel | undefined {
  return PRINTER_DATABASE.find(p => p.id === id);
}

/**
 * Datos de ejemplo para previsualizar la app antes de conectar auth +
 * Supabase (siguiente paso). Estructura multi-mes para que las flechas de
 * navegación, la comparativa y la alerta de subida de gasto (lógica de
 * negocio real, ver src/lib/finanzas.ts) funcionen sobre datos de verdad
 * en vez de un mes suelto.
 */

export interface GastoFijoPlantilla {
  id: string;
  nombre: string;
  categoria: string;
  dia_cobro: number;
  monto: number;
  activo: boolean;
}

export interface GastoMesVM {
  id: string;
  gastoFijoId: string;
  monto: number;
  pagado: boolean;
}

export interface IngresoVM {
  id: string;
  nombre: string;
  monto: number;
  tipo: "fijo" | "extra";
}

export interface CuotaVM {
  id: string;
  numero: number;
  monto: number;
  fecha_cobro: string;
  pagado: boolean;
}

export interface CompraVM {
  id: string;
  nombre: string;
  categoria: string;
  cuotas: CuotaVM[];
}

export interface GastoVariableVM {
  id: string;
  nombre: string;
  categoria: string;
  monto: number;
  fecha: string;
}

export interface MesVM {
  id: string;
  anio: number;
  mes: number;
  saldo_inicial: number;
}

// Plantillas de gasto fijo (tabla gasto_fijo): estables entre meses, se
// clonan en gasto_mes al abrir un mes nuevo (lógica de negocio #2).
export const mockGastoFijoPlantillas: GastoFijoPlantilla[] = [
  { id: "gf1", nombre: "Alquiler", categoria: "vivienda", dia_cobro: 1, monto: 950, activo: true },
  { id: "gf2", nombre: "Internet + móviles", categoria: "suministros", dia_cobro: 5, monto: 62, activo: true },
  { id: "gf3", nombre: "Luz y gas", categoria: "suministros", dia_cobro: 8, monto: 118, activo: true },
  { id: "gf4", nombre: "Gimnasio (x2)", categoria: "salud", dia_cobro: 3, monto: 54, activo: true },
  { id: "gf5", nombre: "Netflix + Spotify", categoria: "ocio", dia_cobro: 12, monto: 24, activo: true },
  { id: "gf6", nombre: "Seguro coche", categoria: "transporte", dia_cobro: 20, monto: 45, activo: false },
];

export const mockMeses: MesVM[] = [
  { id: "mes-jul", anio: 2026, mes: 7, saldo_inicial: 620 },
  { id: "mes-ago", anio: 2026, mes: 8, saldo_inicial: 850 },
  { id: "mes-sep", anio: 2026, mes: 9, saldo_inicial: 0 },
];

// gasto_mes por mes (clave "aaaa-mm"). "Luz y gas" sube de 100€ a 118€ de
// julio a agosto (+18%) a propósito, para que se vea la alerta en acción.
export const mockGastoMesPorMes: Record<string, GastoMesVM[]> = {
  "2026-07": [
    { id: "gm-jul-1", gastoFijoId: "gf1", monto: 950, pagado: true },
    { id: "gm-jul-2", gastoFijoId: "gf2", monto: 60, pagado: true },
    { id: "gm-jul-3", gastoFijoId: "gf3", monto: 100, pagado: true },
    { id: "gm-jul-4", gastoFijoId: "gf4", monto: 54, pagado: true },
    { id: "gm-jul-5", gastoFijoId: "gf5", monto: 24, pagado: true },
  ],
  "2026-08": [
    { id: "gm-ago-1", gastoFijoId: "gf1", monto: 950, pagado: true },
    { id: "gm-ago-2", gastoFijoId: "gf2", monto: 62, pagado: true },
    { id: "gm-ago-3", gastoFijoId: "gf3", monto: 118, pagado: false },
    { id: "gm-ago-4", gastoFijoId: "gf4", monto: 54, pagado: false },
    { id: "gm-ago-5", gastoFijoId: "gf5", monto: 24, pagado: false },
  ],
  "2026-09": [
    { id: "gm-sep-1", gastoFijoId: "gf1", monto: 950, pagado: false },
    { id: "gm-sep-2", gastoFijoId: "gf2", monto: 62, pagado: false },
    { id: "gm-sep-3", gastoFijoId: "gf3", monto: 118, pagado: false },
    { id: "gm-sep-4", gastoFijoId: "gf4", monto: 54, pagado: false },
    { id: "gm-sep-5", gastoFijoId: "gf5", monto: 24, pagado: false },
  ],
};

export const mockIngresosPorMes: Record<string, IngresoVM[]> = {
  "2026-07": [
    { id: "i-jul-1", nombre: "Nómina Cristhian", monto: 2100, tipo: "fijo" },
    { id: "i-jul-2", nombre: "Nómina pareja", monto: 1750, tipo: "fijo" },
  ],
  "2026-08": [
    { id: "i1", nombre: "Nómina Cristhian", monto: 2100, tipo: "fijo" },
    { id: "i2", nombre: "Nómina pareja", monto: 1750, tipo: "fijo" },
    { id: "i3", nombre: "Devolución Hacienda", monto: 180, tipo: "extra" },
  ],
  "2026-09": [
    { id: "i-sep-1", nombre: "Nómina Cristhian", monto: 2100, tipo: "fijo" },
    { id: "i-sep-2", nombre: "Nómina pareja", monto: 1750, tipo: "fijo" },
  ],
};

// Compras a plazos: las cuotas ya llevan fecha_cobro, así que se filtran
// por mes con esa fecha en vez de duplicarse por mes.
export const mockCompras: CompraVM[] = [
  {
    id: "c1",
    nombre: "Sofá (Klarna)",
    categoria: "hogar",
    cuotas: [
      { id: "cu1", numero: 1, monto: 230, fecha_cobro: "2026-06-15", pagado: true },
      { id: "cu2", numero: 2, monto: 230, fecha_cobro: "2026-07-15", pagado: true },
      { id: "cu3", numero: 3, monto: 230, fecha_cobro: "2026-08-15", pagado: false },
    ],
  },
  {
    id: "c2",
    nombre: "Portátil pareja",
    categoria: "tecnologia",
    cuotas: [
      { id: "cu4", numero: 1, monto: 300, fecha_cobro: "2026-08-01", pagado: true },
      { id: "cu5", numero: 2, monto: 300, fecha_cobro: "2026-09-01", pagado: false },
      { id: "cu6", numero: 3, monto: 300, fecha_cobro: "2026-10-01", pagado: false },
      { id: "cu7", numero: 4, monto: 300, fecha_cobro: "2026-11-01", pagado: false },
    ],
  },
];

// Gastos variables: también llevan fecha propia, se filtran igual que las cuotas.
export const mockGastosVariables: GastoVariableVM[] = [
  { id: "gv-jul-1", nombre: "Supermercado", categoria: "comida", monto: 88.2, fecha: "2026-07-04" },
  { id: "gv-jul-2", nombre: "Cine", categoria: "ocio", monto: 22, fecha: "2026-07-18" },
  { id: "gv1", nombre: "Supermercado", categoria: "comida", monto: 96.4, fecha: "2026-08-03" },
  { id: "gv2", nombre: "Farmacia", categoria: "salud", monto: 18.9, fecha: "2026-08-06" },
  { id: "gv3", nombre: "Cena cumpleaños", categoria: "ocio", monto: 64, fecha: "2026-08-10" },
];

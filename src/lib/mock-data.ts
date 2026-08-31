/**
 * Datos de ejemplo para previsualizar la pantalla principal antes de
 * conectar auth + Supabase. Sustituir por queries reales en el siguiente
 * paso (household real, mes en curso, etc.).
 */

export const mockMes = {
  id: "mes-1",
  anio: 2026,
  mes: 8,
  saldo_inicial: 850,
};

export const mockIngresos = [
  { id: "i1", nombre: "Nómina Cristhian", monto: 2100, tipo: "fijo" as const },
  { id: "i2", nombre: "Nómina pareja", monto: 1750, tipo: "fijo" as const },
  { id: "i3", nombre: "Devolución Hacienda", monto: 180, tipo: "extra" as const },
];

export const mockGastosFijos = [
  {
    id: "gf1",
    nombre: "Alquiler",
    categoria: "Vivienda",
    dia_cobro: 1,
    monto: 950,
    pagado: true,
  },
  {
    id: "gf2",
    nombre: "Internet + móviles",
    categoria: "Suministros",
    dia_cobro: 5,
    monto: 62,
    pagado: true,
  },
  {
    id: "gf3",
    nombre: "Luz y gas",
    categoria: "Suministros",
    dia_cobro: 8,
    monto: 118,
    pagado: false,
  },
  {
    id: "gf4",
    nombre: "Gimnasio (x2)",
    categoria: "Salud",
    dia_cobro: 3,
    monto: 54,
    pagado: false,
  },
  {
    id: "gf5",
    nombre: "Netflix + Spotify",
    categoria: "Ocio",
    dia_cobro: 12,
    monto: 24,
    pagado: false,
  },
];

export const mockCompras = [
  {
    id: "c1",
    nombre: "Sofá (Klarna)",
    categoria: "Hogar",
    montoTotal: 690,
    cuotas: [
      { id: "cu1", numero: 1, monto: 230, fecha_cobro: "2026-06-15", pagado: true },
      { id: "cu2", numero: 2, monto: 230, fecha_cobro: "2026-07-15", pagado: true },
      { id: "cu3", numero: 3, monto: 230, fecha_cobro: "2026-08-15", pagado: false },
    ],
  },
  {
    id: "c2",
    nombre: "Portátil pareja",
    categoria: "Tecnología",
    montoTotal: 1200,
    cuotas: [
      { id: "cu4", numero: 1, monto: 300, fecha_cobro: "2026-08-01", pagado: true },
      { id: "cu5", numero: 2, monto: 300, fecha_cobro: "2026-09-01", pagado: false },
      { id: "cu6", numero: 3, monto: 300, fecha_cobro: "2026-10-01", pagado: false },
      { id: "cu7", numero: 4, monto: 300, fecha_cobro: "2026-11-01", pagado: false },
    ],
  },
];

export const mockGastosVariables = [
  { id: "gv1", nombre: "Supermercado", categoria: "Comida", monto: 96.4, fecha: "2026-08-03" },
  { id: "gv2", nombre: "Farmacia", categoria: "Salud", monto: 18.9, fecha: "2026-08-06" },
  { id: "gv3", nombre: "Cena cumpleaños", categoria: "Ocio", monto: 64, fecha: "2026-08-10" },
];

import type { Cuota, GastoMes, GastoVariable, Ingreso, Mes } from "@/lib/types/database";

interface DatosMes {
  mes: Pick<Mes, "saldo_inicial">;
  ingresos: Pick<Ingreso, "monto">[];
  gastosMes: Pick<GastoMes, "monto" | "pagado">[];
  cuotas: Pick<Cuota, "monto" | "pagado">[];
  gastosVariables: Pick<GastoVariable, "monto">[];
}

const sum = (items: { monto: number }[]) =>
  items.reduce((total, item) => total + item.monto, 0);

/** Saldo actual = saldo_inicial + ingresos - gastos pagados (fijos, cuotas del mes, variables). */
export function calcularSaldoActual(datos: DatosMes): number {
  const gastosFijosPagados = sum(datos.gastosMes.filter((g) => g.pagado));
  const cuotasPagadas = sum(datos.cuotas.filter((c) => c.pagado));
  const gastosVariables = sum(datos.gastosVariables);

  return (
    datos.mes.saldo_inicial +
    sum(datos.ingresos) -
    gastosFijosPagados -
    cuotasPagadas -
    gastosVariables
  );
}

/** Pendiente por pagar = gastos fijos + cuotas del mes que aún no se han marcado como pagados. */
export function calcularPendiente(datos: Pick<DatosMes, "gastosMes" | "cuotas">): number {
  const gastosFijosPendientes = sum(datos.gastosMes.filter((g) => !g.pagado));
  const cuotasPendientes = sum(datos.cuotas.filter((c) => !c.pagado));
  return gastosFijosPendientes + cuotasPendientes;
}

export function formatoMoneda(valor: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(valor);
}

export const NOMBRES_MES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

export function claveMes(anio: number, mes: number): string {
  return `${anio}-${String(mes).padStart(2, "0")}`;
}

/**
 * Alerta de subida de gasto (lógica de negocio #5): compara el monto de un
 * gasto_mes contra el mismo gasto_fijo_id en el mes anterior. Devuelve el
 * % de subida si supera el umbral (10% por defecto), null si no aplica.
 */
export function detectarSubida(
  montoActual: number,
  montoAnterior: number | undefined,
  umbral = 0.1,
): number | null {
  if (!montoAnterior || montoAnterior <= 0) return null;
  const variacion = (montoActual - montoAnterior) / montoAnterior;
  if (variacion <= umbral) return null;
  return Math.round(variacion * 100);
}

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

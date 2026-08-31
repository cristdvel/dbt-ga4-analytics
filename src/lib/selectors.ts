import { calcularSaldoActual, claveMes, detectarSubida } from "@/lib/finanzas";
import type {
  CompraVM,
  CuotaVM,
  GastoFijoPlantilla,
  GastoMesVM,
  GastoVariableVM,
  IngresoVM,
  MesVM,
} from "@/lib/mock-data";

/**
 * Selectores puros (reciben los datos, no los importan) para poder usarse
 * tanto con los mock-data de arranque como con el estado local editable de
 * cada pantalla mientras no hay Supabase todavía.
 */

export interface GastoMesResuelto {
  id: string;
  gastoFijoId: string;
  nombre: string;
  categoria: string;
  diaCobro: number;
  monto: number;
  pagado: boolean;
  subioPorcentaje: number | null;
}

export interface CuotaDelMes extends CuotaVM {
  compraId: string;
  compraNombre: string;
  categoria: string;
}

function mesEnFecha(fecha: string, anio: number, mes: number) {
  const [y, m] = fecha.split("-").map(Number);
  return y === anio && m === mes;
}

/** Resuelve gasto_mes + su plantilla gasto_fijo, con la alerta de subida ya calculada. */
export function resolverGastosMes(
  gastoMesPorMes: Record<string, GastoMesVM[]>,
  plantillas: GastoFijoPlantilla[],
  claveMesActual: string,
  claveMesAnterior?: string,
): GastoMesResuelto[] {
  const actuales = gastoMesPorMes[claveMesActual] ?? [];
  const anteriores = claveMesAnterior ? (gastoMesPorMes[claveMesAnterior] ?? []) : [];

  return actuales.map((gm) => {
    const plantilla = plantillas.find((p) => p.id === gm.gastoFijoId);
    const anterior = anteriores.find((a) => a.gastoFijoId === gm.gastoFijoId);

    return {
      id: gm.id,
      gastoFijoId: gm.gastoFijoId,
      nombre: plantilla?.nombre ?? "Gasto",
      categoria: plantilla?.categoria ?? "otros",
      diaCobro: plantilla?.dia_cobro ?? 1,
      monto: gm.monto,
      pagado: gm.pagado,
      subioPorcentaje: detectarSubida(gm.monto, anterior?.monto),
    };
  });
}

export function cuotasDelMes(compras: CompraVM[], anio: number, mes: number): CuotaDelMes[] {
  return compras.flatMap((compra) =>
    compra.cuotas
      .filter((cuota) => mesEnFecha(cuota.fecha_cobro, anio, mes))
      .map((cuota) => ({
        ...cuota,
        compraId: compra.id,
        compraNombre: compra.nombre,
        categoria: compra.categoria,
      })),
  );
}

export function gastosVariablesDelMes(gastosVariables: GastoVariableVM[], anio: number, mes: number) {
  return gastosVariables.filter((g) => mesEnFecha(g.fecha, anio, mes));
}

export function ingresosDelMes(ingresosPorMes: Record<string, IngresoVM[]>, claveMesActual: string) {
  return ingresosPorMes[claveMesActual] ?? [];
}

/**
 * Saldo actual encadenado mes a mes (lógica de negocio #2: el saldo_inicial
 * de un mes se sugiere a partir del saldo actual calculado del anterior).
 * Solo el primer mes usa su saldo_inicial propio; el resto se deriva.
 * Devuelve un array paralelo a `meses` con el saldo actual de cada uno.
 */
export function calcularSaldosPorMes(
  meses: MesVM[],
  gastoMesPorMes: Record<string, GastoMesVM[]>,
  plantillas: GastoFijoPlantilla[],
  compras: CompraVM[],
  gastosVariables: GastoVariableVM[],
  ingresosPorMes: Record<string, IngresoVM[]>,
): number[] {
  let saldoInicial = meses[0]?.saldo_inicial ?? 0;

  return meses.map((mes) => {
    const clave = claveMes(mes.anio, mes.mes);
    const saldo = calcularSaldoActual({
      mes: { saldo_inicial: saldoInicial },
      ingresos: ingresosDelMes(ingresosPorMes, clave),
      gastosMes: resolverGastosMes(gastoMesPorMes, plantillas, clave),
      cuotas: cuotasDelMes(compras, mes.anio, mes.mes),
      gastosVariables: gastosVariablesDelMes(gastosVariables, mes.anio, mes.mes),
    });
    saldoInicial = saldo;
    return saldo;
  });
}

/**
 * Lógica de negocio #6: agrupa gasto_mes + cuota + gasto_variable por
 * categoría y mes. Devuelve, por categoría, un array de totales paralelo a
 * `meses` — la base del gráfico de tendencia por categoría.
 */
export function totalesPorCategoriaYMes(
  meses: MesVM[],
  gastoMesPorMes: Record<string, GastoMesVM[]>,
  plantillas: GastoFijoPlantilla[],
  compras: CompraVM[],
  gastosVariables: GastoVariableVM[],
): Record<string, number[]> {
  const totales: Record<string, number[]> = {};

  const acumular = (categoria: string, index: number, monto: number) => {
    if (!totales[categoria]) totales[categoria] = meses.map(() => 0);
    totales[categoria][index] += monto;
  };

  meses.forEach((mes, index) => {
    const clave = claveMes(mes.anio, mes.mes);
    for (const g of resolverGastosMes(gastoMesPorMes, plantillas, clave)) {
      acumular(g.categoria, index, g.monto);
    }
    for (const c of cuotasDelMes(compras, mes.anio, mes.mes)) {
      acumular(c.categoria, index, c.monto);
    }
    for (const v of gastosVariablesDelMes(gastosVariables, mes.anio, mes.mes)) {
      acumular(v.categoria, index, v.monto);
    }
  });

  return totales;
}

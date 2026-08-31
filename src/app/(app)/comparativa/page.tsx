"use client";

import { useMemo } from "react";
import { MiniTrendChart } from "@/components/mini-trend-chart";
import { NOMBRES_MES, formatoMoneda } from "@/lib/finanzas";
import { getCategoria } from "@/lib/categorias";
import {
  mockCompras,
  mockGastoFijoPlantillas,
  mockGastoMesPorMes,
  mockGastosVariables,
  mockMeses,
} from "@/lib/mock-data";
import { totalesPorCategoriaYMes } from "@/lib/selectors";

const GOOD = "#0ca30c";
const WARNING = "#fab219";

/**
 * Lógica de negocio #6: Σ monto agrupado por categoría y mes (gasto_mes +
 * cuota + gasto_variable). Un small multiple por categoría en vez de un
 * único gráfico con 8 líneas superpuestas — más legible y evita mezclar
 * demasiados tonos categóricos en un gráfico "todos contra todos".
 */
export default function ComparativaPage() {
  const etiquetas = mockMeses.map((m) => NOMBRES_MES[m.mes - 1].slice(0, 3));

  const totales = useMemo(
    () =>
      totalesPorCategoriaYMes(
        mockMeses,
        mockGastoMesPorMes,
        mockGastoFijoPlantillas,
        mockCompras,
        mockGastosVariables,
      ),
    [],
  );

  const filas = Object.entries(totales)
    .map(([categoriaId, valores]) => ({ categoria: getCategoria(categoriaId), valores }))
    .filter((fila) => fila.valores.some((v) => v > 0))
    .sort((a, b) => b.valores.at(-1)! - a.valores.at(-1)!);

  return (
    <div className="min-h-full bg-slate-950">
      <div className="mx-auto flex min-h-full max-w-md flex-col gap-6 px-4 pb-24 pt-6 md:max-w-2xl md:px-8 md:pb-10">
        <header>
          <h1 className="text-lg font-semibold text-white">Comparativa por categoría</h1>
          <p className="mt-1 text-sm text-slate-400">Gasto total por categoría, mes a mes.</p>
        </header>

        <div className="grid gap-4 sm:grid-cols-2">
          {filas.map(({ categoria, valores }) => {
            const actual = valores.at(-1)!;
            const anterior = valores.at(-2);
            const variacion = anterior ? ((actual - anterior) / anterior) * 100 : null;

            return (
              <div
                key={categoria.id}
                className="rounded-2xl bg-slate-900 p-4 ring-1 ring-white/5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span aria-hidden>{categoria.icono}</span>
                    <span className="text-sm font-medium text-slate-200">{categoria.nombre}</span>
                  </div>
                  <span className="text-sm font-semibold tabular-nums text-slate-100">
                    {formatoMoneda(actual)}
                  </span>
                </div>

                <MiniTrendChart valores={valores} etiquetas={etiquetas} color={categoria.color} />

                {variacion !== null && (
                  <p
                    className="mt-1 text-right text-[11px] font-medium"
                    style={{ color: variacion > 10 ? WARNING : variacion < 0 ? GOOD : "#64748b" }}
                  >
                    {variacion > 0 ? "▲" : variacion < 0 ? "▼" : "–"} {Math.abs(Math.round(variacion))}%
                    vs {etiquetas.at(-2)}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {filas.length === 0 && (
          <p className="px-4 py-6 text-center text-sm text-slate-500">
            Todavía no hay gasto suficiente para comparar.
          </p>
        )}
      </div>
    </div>
  );
}

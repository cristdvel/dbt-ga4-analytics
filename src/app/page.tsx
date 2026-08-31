"use client";

import { useMemo, useState } from "react";
import { SaldoCard } from "@/components/saldo-card";
import { Seccion } from "@/components/seccion";
import { IngresoRow } from "@/components/ingreso-row";
import { GastoFijoRow } from "@/components/gasto-fijo-row";
import { CompraRow } from "@/components/compra-row";
import { GastoVariableRow } from "@/components/gasto-variable-row";
import { calcularPendiente, calcularSaldoActual, formatoMoneda } from "@/lib/finanzas";
import {
  mockCompras,
  mockGastosFijos,
  mockGastosVariables,
  mockIngresos,
  mockMes,
} from "@/lib/mock-data";

/**
 * Preview de la pantalla principal con datos de ejemplo y estado local
 * (checkboxes, expandir compra). Sin conexión a Supabase todavía — eso
 * llega en el siguiente paso, junto con auth. Entonces este componente
 * pasa a ser server component con fetch inicial + islas de cliente sólo
 * para lo interactivo (checkboxes, expandir).
 */
export default function Home() {
  const [gastosFijos, setGastosFijos] = useState(mockGastosFijos);
  const [compras, setCompras] = useState(mockCompras);

  const toggleGastoFijo = (id: string) => {
    setGastosFijos((prev) =>
      prev.map((g) => (g.id === id ? { ...g, pagado: !g.pagado } : g)),
    );
  };

  const toggleCuota = (compraId: string, cuotaId: string) => {
    setCompras((prev) =>
      prev.map((c) =>
        c.id !== compraId
          ? c
          : {
              ...c,
              cuotas: c.cuotas.map((cu) =>
                cu.id === cuotaId ? { ...cu, pagado: !cu.pagado } : cu,
              ),
            },
      ),
    );
  };

  const todasLasCuotas = useMemo(() => compras.flatMap((c) => c.cuotas), [compras]);

  const saldo = calcularSaldoActual({
    mes: mockMes,
    ingresos: mockIngresos,
    gastosMes: gastosFijos,
    cuotas: todasLasCuotas,
    gastosVariables: mockGastosVariables,
  });

  const pendiente = calcularPendiente({ gastosMes: gastosFijos, cuotas: todasLasCuotas });

  const totalIngresos = mockIngresos.reduce((t, i) => t + i.monto, 0);
  const totalVariables = mockGastosVariables.reduce((t, g) => t + g.monto, 0);

  return (
    <div className="min-h-full bg-slate-950">
      <div className="mx-auto flex min-h-full max-w-md flex-col gap-6 px-4 pb-24 pt-6">
        <header className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-white">Finanzas Familiares</h1>
          <button
            type="button"
            className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300"
          >
            agosto 2026 ▾
          </button>
        </header>

        <SaldoCard saldo={saldo} pendiente={pendiente} anio={mockMes.anio} mes={mockMes.mes} />

        <Seccion titulo="Ingresos" total={formatoMoneda(totalIngresos)} onAdd={() => {}}>
          {mockIngresos.map((ingreso) => (
            <IngresoRow key={ingreso.id} {...ingreso} />
          ))}
        </Seccion>

        <Seccion titulo="Gastos fijos" total={formatoMoneda(pendiente)} onAdd={() => {}}>
          {gastosFijos.map((gasto) => (
            <GastoFijoRow
              key={gasto.id}
              nombre={gasto.nombre}
              categoria={gasto.categoria}
              diaCobro={gasto.dia_cobro}
              monto={gasto.monto}
              pagado={gasto.pagado}
              onToggle={() => toggleGastoFijo(gasto.id)}
            />
          ))}
        </Seccion>

        <Seccion titulo="Compras a plazos" onAdd={() => {}}>
          {compras.map((compra) => (
            <CompraRow
              key={compra.id}
              nombre={compra.nombre}
              categoria={compra.categoria}
              cuotas={compra.cuotas}
              onToggleCuota={(cuotaId) => toggleCuota(compra.id, cuotaId)}
            />
          ))}
        </Seccion>

        <Seccion titulo="Gastos variables" total={formatoMoneda(totalVariables)} onAdd={() => {}}>
          {mockGastosVariables.map((gasto) => (
            <GastoVariableRow key={gasto.id} {...gasto} />
          ))}
        </Seccion>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { CategoryBadge } from "@/components/category-badge";
import { GastoFijoForm } from "@/components/forms/gasto-fijo-form";
import { Seccion } from "@/components/seccion";
import { ToggleSwitch } from "@/components/toggle-switch";
import { formatoMoneda } from "@/lib/finanzas";
import { mockGastoFijoPlantillas, type GastoFijoPlantilla } from "@/lib/mock-data";

/**
 * Gestión de gasto_fijo (las "plantillas" que se clonan en gasto_mes cada
 * mes). Desactivar nunca borra el histórico ya generado (lógica de negocio
 * #4): sólo dice "no lo vuelvas a generar el mes que viene".
 */
export default function RecurrentesPage() {
  const [plantillas, setPlantillas] = useState<GastoFijoPlantilla[]>(mockGastoFijoPlantillas);
  const [modalAbierto, setModalAbierto] = useState(false);

  const activos = plantillas.filter((p) => p.activo);
  const inactivos = plantillas.filter((p) => !p.activo);
  const totalMensual = activos.reduce((t, p) => t + p.monto, 0);

  const toggleActivo = (id: string) => {
    setPlantillas((prev) => prev.map((p) => (p.id === id ? { ...p, activo: !p.activo } : p)));
  };

  return (
    <div className="min-h-full bg-slate-950">
      <div className="mx-auto flex min-h-full max-w-md flex-col gap-6 px-4 pb-24 pt-6 md:max-w-2xl md:px-8 md:pb-10">
        <header>
          <h1 className="text-lg font-semibold text-white">Gastos recurrentes</h1>
          <p className="mt-1 text-sm text-slate-400">
            Se clonan automáticamente cada mes mientras estén activos.{" "}
            <span className="text-slate-300">{formatoMoneda(totalMensual)}/mes</span> en total.
          </p>
        </header>

        <Seccion titulo="Activos" onAdd={() => setModalAbierto(true)}>
          {activos.length === 0 && (
            <p className="px-4 py-6 text-center text-sm text-slate-500">
              No tienes gastos fijos activos todavía.
            </p>
          )}
          {activos.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-3 border-b border-white/5 px-4 py-3 last:border-0"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-slate-200">{p.nombre}</p>
                <div className="mt-1 flex items-center gap-1.5">
                  <CategoryBadge categoriaId={p.categoria} />
                  <span className="text-[11px] text-slate-500">día {p.dia_cobro}</span>
                </div>
              </div>
              <span className="shrink-0 text-sm font-medium tabular-nums text-slate-200">
                {formatoMoneda(p.monto)}
              </span>
              <ToggleSwitch checked={p.activo} onChange={() => toggleActivo(p.id)} label={`Desactivar ${p.nombre}`} />
            </div>
          ))}
        </Seccion>

        {inactivos.length > 0 && (
          <Seccion titulo="Desactivados">
            {inactivos.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 border-b border-white/5 px-4 py-3 opacity-50 last:border-0"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-slate-400 line-through">{p.nombre}</p>
                  <div className="mt-1 flex items-center gap-1.5">
                    <CategoryBadge categoriaId={p.categoria} />
                  </div>
                </div>
                <span className="shrink-0 text-sm tabular-nums text-slate-500">
                  {formatoMoneda(p.monto)}
                </span>
                <ToggleSwitch checked={p.activo} onChange={() => toggleActivo(p.id)} label={`Reactivar ${p.nombre}`} />
              </div>
            ))}
          </Seccion>
        )}

        <p className="text-xs text-slate-600">
          Desactivar un gasto no borra su historial: el gasto ya generado este mes se mantiene, y deja de
          clonarse a partir del mes siguiente.
        </p>
      </div>

      {modalAbierto && (
        <GastoFijoForm
          onClose={() => setModalAbierto(false)}
          onGuardar={(datos) =>
            setPlantillas((prev) => [...prev, { ...datos, id: `gf-${Date.now()}`, activo: true }])
          }
        />
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { CategoryBadge } from "@/components/category-badge";
import { formatoMoneda } from "@/lib/finanzas";
import type { CuotaVM } from "@/lib/mock-data";

export function CompraRow({
  nombre,
  categoria,
  cuotas,
  onToggleCuota,
}: {
  nombre: string;
  categoria: string;
  cuotas: CuotaVM[];
  onToggleCuota: (cuotaId: string) => void;
}) {
  const [abierta, setAbierta] = useState(false);

  const pagadas = cuotas.filter((c) => c.pagado).length;
  const restante = cuotas.filter((c) => !c.pagado).reduce((t, c) => t + c.monto, 0);
  const completada = pagadas === cuotas.length;

  return (
    <div className="border-b border-white/5 last:border-0">
      <button
        type="button"
        onClick={() => setAbierta((v) => !v)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        <span
          className={`flex h-6 w-6 shrink-0 items-center justify-center text-slate-500 transition-transform ${
            abierta ? "rotate-90" : ""
          }`}
        >
          ›
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm text-slate-200">{nombre}</p>
          <div className="mt-0.5 flex items-center gap-2">
            <CategoryBadge categoriaId={categoria} />
            <span className="text-[11px] text-slate-500">
              {pagadas}/{cuotas.length}
            </span>
          </div>
        </div>
        <span
          className={`shrink-0 text-sm font-medium tabular-nums ${
            completada ? "text-slate-500" : "text-slate-200"
          }`}
        >
          {completada ? "Pagada" : `quedan ${formatoMoneda(restante)}`}
        </span>
      </button>

      {abierta && (
        <div className="bg-slate-950/40 px-4 pb-2">
          {cuotas.map((cuota) => (
            <label
              key={cuota.id}
              className="flex cursor-pointer items-center gap-3 border-t border-white/5 py-2.5 pl-9"
            >
              <input
                type="checkbox"
                checked={cuota.pagado}
                onChange={() => onToggleCuota(cuota.id)}
                className="h-4 w-4 shrink-0 rounded border-slate-600 bg-slate-800 accent-emerald-500"
              />
              <span
                className={`flex-1 text-sm ${
                  cuota.pagado ? "text-slate-500 line-through" : "text-slate-300"
                }`}
              >
                Cuota {cuota.numero}
              </span>
              <span className="text-[11px] text-slate-500">
                {new Date(cuota.fecha_cobro).toLocaleDateString("es-ES", {
                  day: "2-digit",
                  month: "short",
                })}
              </span>
              <span
                className={`w-16 shrink-0 text-right text-sm tabular-nums ${
                  cuota.pagado ? "text-slate-500" : "text-slate-300"
                }`}
              >
                {formatoMoneda(cuota.monto)}
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

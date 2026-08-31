"use client";

import { useState } from "react";
import { CATEGORIAS } from "@/lib/categorias";
import { Seccion } from "@/components/seccion";
import { ToggleSwitch } from "@/components/toggle-switch";

const MIEMBROS_EJEMPLO = [
  { nombre: "Cristhian", email: "velasquez.cristhian@gmail.com" },
  { nombre: "Pareja", email: "—" },
];

export default function AjustesPage() {
  const [notificaciones, setNotificaciones] = useState(true);

  return (
    <div className="min-h-full bg-slate-950">
      <div className="mx-auto flex min-h-full max-w-md flex-col gap-6 px-4 pb-24 pt-6 md:max-w-2xl md:px-8 md:pb-10">
        <header>
          <h1 className="text-lg font-semibold text-white">Ajustes</h1>
          <p className="mt-1 text-sm text-slate-400">Household, categorías y preferencias.</p>
        </header>

        <Seccion titulo="Household">
          {MIEMBROS_EJEMPLO.map((m) => (
            <div key={m.nombre} className="flex items-center gap-3 border-b border-white/5 px-4 py-3 last:border-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-800 text-sm font-medium text-slate-300">
                {m.nombre.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-slate-200">{m.nombre}</p>
                <p className="truncate text-xs text-slate-500">{m.email}</p>
              </div>
            </div>
          ))}
          <div className="border-t border-white/5 px-4 py-3">
            <button
              type="button"
              disabled
              className="text-sm text-slate-500"
              title="Disponible cuando se conecte Supabase Auth"
            >
              + Invitar por email (próximamente)
            </button>
          </div>
        </Seccion>

        <Seccion titulo="Notificaciones">
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="text-sm text-slate-200">Recordatorios de cobro</p>
              <p className="text-xs text-slate-500">Push el día antes y el día del cobro</p>
            </div>
            <ToggleSwitch checked={notificaciones} onChange={() => setNotificaciones((v) => !v)} label="Recordatorios de cobro" />
          </div>
        </Seccion>

        <Seccion titulo="Categorías">
          <div className="flex flex-wrap gap-2 p-4">
            {CATEGORIAS.map((c) => (
              <span
                key={c.id}
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
                style={{ backgroundColor: `${c.color}26`, color: c.color }}
              >
                <span aria-hidden>{c.icono}</span>
                {c.nombre}
              </span>
            ))}
          </div>
        </Seccion>

        <Seccion titulo="Datos">
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="text-sm text-slate-200">Exportar a CSV / Excel</p>
              <p className="text-xs text-slate-500">Ingresos, gastos y cuotas por rango de meses</p>
            </div>
            <button
              type="button"
              disabled
              className="rounded-full bg-slate-800 px-3 py-1.5 text-xs text-slate-500"
              title="Siguiente iteración"
            >
              Próximamente
            </button>
          </div>
        </Seccion>

        <p className="text-xs text-slate-600">
          Sesión: {MIEMBROS_EJEMPLO[0].email} — cierre de sesión disponible cuando esté conectada la auth.
        </p>
      </div>
    </div>
  );
}

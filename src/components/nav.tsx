"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/", label: "Inicio", icono: "🏠" },
  { href: "/comparativa", label: "Comparativa", icono: "📊" },
  { href: "/recurrentes", label: "Recurrentes", icono: "🔁" },
  { href: "/ajustes", label: "Ajustes", icono: "⚙️" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <>
      {/* Móvil: barra inferior fija */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-white/5 bg-slate-900/95 backdrop-blur md:hidden">
        {ITEMS.map((item) => {
          const activo = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px]"
            >
              <span aria-hidden className={activo ? "" : "opacity-60"}>
                {item.icono}
              </span>
              <span className={activo ? "font-medium text-emerald-400" : "text-slate-500"}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Escritorio: sidebar fija */}
      <nav className="fixed inset-y-0 left-0 z-40 hidden w-56 flex-col border-r border-white/5 bg-slate-900 px-3 py-6 md:flex">
        <p className="mb-6 px-3 text-sm font-semibold text-white">Finanzas Familiares</p>
        <div className="flex flex-col gap-1">
          {ITEMS.map((item) => {
            const activo = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition ${
                  activo
                    ? "bg-emerald-500/10 font-medium text-emerald-400"
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                }`}
              >
                <span aria-hidden>{item.icono}</span>
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

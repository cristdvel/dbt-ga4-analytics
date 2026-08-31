import { Badge } from "@/components/badge";
import { formatoMoneda } from "@/lib/finanzas";

export function GastoVariableRow({
  nombre,
  categoria,
  fecha,
  monto,
}: {
  nombre: string;
  categoria: string;
  fecha: string;
  monto: number;
}) {
  const fechaCorta = new Date(fecha).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
  });

  return (
    <div className="flex items-center justify-between border-b border-white/5 px-4 py-3 last:border-0">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-slate-200">{nombre}</p>
        <div className="mt-0.5 flex items-center gap-2">
          <Badge>{categoria}</Badge>
          <span className="text-[11px] text-slate-500">{fechaCorta}</span>
        </div>
      </div>
      <span className="shrink-0 text-sm font-medium tabular-nums text-slate-200">
        -{formatoMoneda(monto)}
      </span>
    </div>
  );
}

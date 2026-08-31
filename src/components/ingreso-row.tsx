import { Badge } from "@/components/badge";
import { formatoMoneda } from "@/lib/finanzas";

export function IngresoRow({
  nombre,
  monto,
  tipo,
}: {
  nombre: string;
  monto: number;
  tipo: "fijo" | "extra";
}) {
  return (
    <div className="flex items-center justify-between border-b border-white/5 px-4 py-3 last:border-0">
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-200">{nombre}</span>
        {tipo === "extra" && <Badge>Extra</Badge>}
      </div>
      <span className="text-sm font-medium tabular-nums text-emerald-400">
        +{formatoMoneda(monto)}
      </span>
    </div>
  );
}

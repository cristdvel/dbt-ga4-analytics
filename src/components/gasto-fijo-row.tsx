import { AlertaSubidaBadge } from "@/components/alerta-badge";
import { CategoryBadge } from "@/components/category-badge";
import { formatoMoneda } from "@/lib/finanzas";

export function GastoFijoRow({
  nombre,
  categoria,
  diaCobro,
  monto,
  pagado,
  subioPorcentaje,
  onToggle,
}: {
  nombre: string;
  categoria: string;
  diaCobro: number;
  monto: number;
  pagado: boolean;
  subioPorcentaje?: number | null;
  onToggle: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 border-b border-white/5 px-4 py-3 last:border-0">
      <input
        type="checkbox"
        checked={pagado}
        onChange={onToggle}
        className="h-5 w-5 shrink-0 rounded-md border-slate-600 bg-slate-800 accent-emerald-500"
      />
      <div className="min-w-0 flex-1">
        <p
          className={`truncate text-sm ${pagado ? "text-slate-500 line-through" : "text-slate-200"}`}
        >
          {nombre}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <CategoryBadge categoriaId={categoria} />
          <span className="text-[11px] text-slate-500">día {diaCobro}</span>
          {!!subioPorcentaje && <AlertaSubidaBadge porcentaje={subioPorcentaje} />}
        </div>
      </div>
      <span
        className={`shrink-0 text-sm font-medium tabular-nums ${
          pagado ? "text-slate-500" : "text-slate-200"
        }`}
      >
        {formatoMoneda(monto)}
      </span>
    </label>
  );
}

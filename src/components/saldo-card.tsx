import { NOMBRES_MES, formatoMoneda } from "@/lib/finanzas";

export function SaldoCard({
  saldo,
  pendiente,
  anio,
  mes,
}: {
  saldo: number;
  pendiente: number;
  anio: number;
  mes: number;
}) {
  const enNegativo = saldo < 0;

  return (
    <div className="rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 p-6 shadow-lg shadow-black/20 ring-1 ring-white/5">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {NOMBRES_MES[mes - 1]} {anio} · saldo actual
      </p>
      <p
        className={`mt-1 text-4xl font-semibold tabular-nums ${
          enNegativo ? "text-red-400" : "text-emerald-400"
        }`}
      >
        {formatoMoneda(saldo)}
      </p>
      <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-4">
        <span className="text-sm text-slate-400">Pendiente por pagar</span>
        <span className="text-sm font-semibold tabular-nums text-amber-400">
          {formatoMoneda(pendiente)}
        </span>
      </div>
    </div>
  );
}

import { NOMBRES_MES } from "@/lib/finanzas";

export function MonthSwitcher({
  anio,
  mes,
  onPrev,
  onNext,
  disablePrev,
  disableNext,
}: {
  anio: number;
  mes: number;
  onPrev: () => void;
  onNext: () => void;
  disablePrev: boolean;
  disableNext: boolean;
}) {
  return (
    <div className="flex items-center gap-1 rounded-full bg-slate-800 px-1 py-1 text-xs text-slate-300">
      <button
        type="button"
        onClick={onPrev}
        disabled={disablePrev}
        aria-label="Mes anterior"
        className="flex h-6 w-6 items-center justify-center rounded-full transition hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent"
      >
        ‹
      </button>
      <span className="min-w-24 text-center capitalize">
        {NOMBRES_MES[mes - 1]} {anio}
      </span>
      <button
        type="button"
        onClick={onNext}
        disabled={disableNext}
        aria-label="Mes siguiente"
        className="flex h-6 w-6 items-center justify-center rounded-full transition hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent"
      >
        ›
      </button>
    </div>
  );
}

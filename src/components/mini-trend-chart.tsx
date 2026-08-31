import { formatoMoneda } from "@/lib/finanzas";

/**
 * Small multiple de barras para una sola categoría (1 serie => color solo
 * es seguro, sin leyenda). Pensado para verse en rejilla junto a otras
 * categorías en vez de amontonar 8 líneas en un único gráfico.
 */
export function MiniTrendChart({
  valores,
  etiquetas,
  color,
}: {
  valores: number[];
  etiquetas: string[];
  color: string;
}) {
  const max = Math.max(...valores, 1);

  return (
    <div className="flex h-20 items-end gap-1.5">
      {valores.map((valor, i) => {
        const alturaPct = Math.max((valor / max) * 100, valor > 0 ? 6 : 0);
        const esUltimo = i === valores.length - 1;
        return (
          <div key={etiquetas[i]} className="group relative flex flex-1 flex-col items-center gap-1">
            <div className="relative flex h-16 w-full max-w-6 items-end justify-center">
              <span className="pointer-events-none absolute -top-6 whitespace-nowrap rounded-md bg-slate-950 px-1.5 py-0.5 text-[10px] text-slate-200 opacity-0 shadow ring-1 ring-white/10 transition-opacity group-hover:opacity-100">
                {formatoMoneda(valor)}
              </span>
              <div
                className="w-full rounded-t-[4px]"
                style={{
                  height: `${alturaPct}%`,
                  backgroundColor: color,
                  opacity: esUltimo ? 1 : 0.55,
                }}
              />
            </div>
            <span className="text-[10px] uppercase text-slate-500">{etiquetas[i]}</span>
          </div>
        );
      })}
    </div>
  );
}

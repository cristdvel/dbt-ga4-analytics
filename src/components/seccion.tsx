export function Seccion({
  titulo,
  total,
  onAdd,
  children,
}: {
  titulo: string;
  total?: string;
  onAdd?: () => void;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-300">{titulo}</h2>
        <div className="flex items-center gap-3">
          {total && <span className="text-xs tabular-nums text-slate-500">{total}</span>}
          {onAdd && (
            <button
              type="button"
              onClick={onAdd}
              aria-label={`Añadir a ${titulo.toLowerCase()}`}
              className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-slate-300 transition hover:bg-slate-700"
            >
              +
            </button>
          )}
        </div>
      </div>
      <div className="overflow-hidden rounded-2xl bg-slate-900 ring-1 ring-white/5">
        {children}
      </div>
    </section>
  );
}

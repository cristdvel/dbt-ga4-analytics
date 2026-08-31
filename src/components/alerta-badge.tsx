/** Color de estado "warning" fijo del sistema (nunca reutilizado como categórico). */
const WARNING = "#fab219";

export function AlertaSubidaBadge({ porcentaje }: { porcentaje: number }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold"
      style={{ backgroundColor: `${WARNING}22`, color: WARNING }}
      title={`Subió un ${porcentaje}% respecto al mes anterior`}
    >
      <span aria-hidden>⚠</span>
      +{porcentaje}%
    </span>
  );
}

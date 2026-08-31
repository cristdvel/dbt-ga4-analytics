import { getCategoria } from "@/lib/categorias";

export function CategoryBadge({ categoriaId }: { categoriaId: string }) {
  const categoria = getCategoria(categoriaId);

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium"
      style={{ backgroundColor: `${categoria.color}26`, color: categoria.color }}
    >
      <span aria-hidden>{categoria.icono}</span>
      {categoria.nombre}
    </span>
  );
}

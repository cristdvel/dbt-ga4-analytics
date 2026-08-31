/**
 * Paleta categórica fija (orden = mecanismo de seguridad CVD, no cosmético)
 * validada con scripts/validate_palette.js del skill dataviz contra el
 * fondo de las tarjetas de la app (#0f172a, slate-900): 8/8 checks OK
 * (banda de luminosidad, floor de croma, separación CVD adyacente >=8,
 * floor de visión normal >=15, contraste >=3:1). "Otros" no forma parte
 * del set validado — usa el gris neutro de la UI a propósito (catch-all,
 * nunca un 9º tono generado).
 */
export interface Categoria {
  id: string;
  nombre: string;
  icono: string;
  color: string;
}

export const CATEGORIAS: Categoria[] = [
  { id: "vivienda", nombre: "Vivienda", icono: "🏠", color: "#3987e5" },
  { id: "suministros", nombre: "Suministros", icono: "⚡", color: "#d95926" },
  { id: "comida", nombre: "Comida", icono: "🛒", color: "#199e70" },
  { id: "ocio", nombre: "Ocio", icono: "🎮", color: "#c98500" },
  { id: "salud", nombre: "Salud", icono: "❤️", color: "#d55181" },
  { id: "hogar", nombre: "Hogar", icono: "🛋️", color: "#008300" },
  { id: "tecnologia", nombre: "Tecnología", icono: "💻", color: "#9085e9" },
  { id: "transporte", nombre: "Transporte", icono: "🚗", color: "#e66767" },
  { id: "otros", nombre: "Otros", icono: "📦", color: "#64748b" },
];

const porId = new Map(CATEGORIAS.map((c) => [c.id, c]));

export function getCategoria(id: string): Categoria {
  return porId.get(id) ?? CATEGORIAS[CATEGORIAS.length - 1];
}

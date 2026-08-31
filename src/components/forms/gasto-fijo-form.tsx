"use client";

import { useState } from "react";
import { BotonGuardar, CampoSelect, CampoTexto, Modal } from "@/components/modal";
import { CATEGORIAS } from "@/lib/categorias";
import type { GastoFijoPlantilla } from "@/lib/mock-data";

export function GastoFijoForm({
  onClose,
  onGuardar,
}: {
  onClose: () => void;
  onGuardar: (gasto: Omit<GastoFijoPlantilla, "id" | "activo">) => void;
}) {
  const [nombre, setNombre] = useState("");
  const [monto, setMonto] = useState("");
  const [diaCobro, setDiaCobro] = useState("1");
  const [categoria, setCategoria] = useState(CATEGORIAS[0].id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !monto) return;
    onGuardar({
      nombre: nombre.trim(),
      monto: Number(monto),
      dia_cobro: Number(diaCobro),
      categoria,
    });
    onClose();
  };

  return (
    <Modal titulo="Añadir gasto fijo" onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <CampoTexto
          label="Nombre"
          placeholder="Alquiler, seguro…"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />
        <div className="grid grid-cols-2 gap-3">
          <CampoTexto
            label="Importe (€)"
            type="number"
            step="0.01"
            min="0"
            inputMode="decimal"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            required
          />
          <CampoTexto
            label="Día de cobro"
            type="number"
            min="1"
            max="31"
            value={diaCobro}
            onChange={(e) => setDiaCobro(e.target.value)}
            required
          />
        </div>
        <CampoSelect label="Categoría" value={categoria} onChange={(e) => setCategoria(e.target.value)}>
          {CATEGORIAS.map((c) => (
            <option key={c.id} value={c.id}>
              {c.icono} {c.nombre}
            </option>
          ))}
        </CampoSelect>
        <BotonGuardar>Añadir gasto fijo</BotonGuardar>
      </form>
    </Modal>
  );
}

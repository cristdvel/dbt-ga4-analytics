"use client";

import { useState } from "react";
import { BotonGuardar, CampoSelect, CampoTexto, Modal } from "@/components/modal";
import { CATEGORIAS } from "@/lib/categorias";
import type { GastoVariableVM } from "@/lib/mock-data";

export function GastoVariableForm({
  onClose,
  onGuardar,
}: {
  onClose: () => void;
  onGuardar: (gasto: Omit<GastoVariableVM, "id">) => void;
}) {
  const [nombre, setNombre] = useState("");
  const [monto, setMonto] = useState("");
  const [categoria, setCategoria] = useState(CATEGORIAS[0].id);
  const [fecha, setFecha] = useState(() => new Date().toISOString().slice(0, 10));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !monto) return;
    onGuardar({ nombre: nombre.trim(), monto: Number(monto), categoria, fecha });
    onClose();
  };

  return (
    <Modal titulo="Añadir gasto variable" onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <CampoTexto
          label="Nombre"
          placeholder="Supermercado, cena…"
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
            label="Fecha"
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
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
        <BotonGuardar>Añadir gasto</BotonGuardar>
      </form>
    </Modal>
  );
}

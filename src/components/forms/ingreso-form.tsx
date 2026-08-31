"use client";

import { useState } from "react";
import { BotonGuardar, CampoSelect, CampoTexto, Modal } from "@/components/modal";
import type { IngresoVM } from "@/lib/mock-data";

export function IngresoForm({
  onClose,
  onGuardar,
}: {
  onClose: () => void;
  onGuardar: (ingreso: Omit<IngresoVM, "id">) => void;
}) {
  const [nombre, setNombre] = useState("");
  const [monto, setMonto] = useState("");
  const [tipo, setTipo] = useState<"fijo" | "extra">("fijo");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !monto) return;
    onGuardar({ nombre: nombre.trim(), monto: Number(monto), tipo });
    onClose();
  };

  return (
    <Modal titulo="Añadir ingreso" onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <CampoTexto
          label="Nombre"
          placeholder="Nómina, bonus…"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />
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
        <CampoSelect label="Tipo" value={tipo} onChange={(e) => setTipo(e.target.value as "fijo" | "extra")}>
          <option value="fijo">Fijo</option>
          <option value="extra">Extra</option>
        </CampoSelect>
        <BotonGuardar>Añadir ingreso</BotonGuardar>
      </form>
    </Modal>
  );
}

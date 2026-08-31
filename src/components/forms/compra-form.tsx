"use client";

import { useState } from "react";
import { BotonGuardar, CampoSelect, CampoTexto, Modal } from "@/components/modal";
import { CATEGORIAS } from "@/lib/categorias";
import type { CompraVM } from "@/lib/mock-data";

function generarCuotas(montoTotal: number, numCuotas: number, primeraFecha: string): CompraVM["cuotas"] {
  const montoCuota = Math.round((montoTotal / numCuotas) * 100) / 100;
  const [anio, mes, dia] = primeraFecha.split("-").map(Number);

  return Array.from({ length: numCuotas }, (_, i) => {
    const fecha = new Date(anio, mes - 1 + i, dia);
    return {
      id: `cuota-${Date.now()}-${i}`,
      numero: i + 1,
      monto: montoCuota,
      fecha_cobro: fecha.toISOString().slice(0, 10),
      pagado: false,
    };
  });
}

export function CompraForm({
  onClose,
  onGuardar,
}: {
  onClose: () => void;
  onGuardar: (compra: Omit<CompraVM, "id">) => void;
}) {
  const [nombre, setNombre] = useState("");
  const [montoTotal, setMontoTotal] = useState("");
  const [numCuotas, setNumCuotas] = useState("3");
  const [primeraFecha, setPrimeraFecha] = useState(() => new Date().toISOString().slice(0, 10));
  const [categoria, setCategoria] = useState(CATEGORIAS[0].id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !montoTotal || !numCuotas) return;
    onGuardar({
      nombre: nombre.trim(),
      categoria,
      cuotas: generarCuotas(Number(montoTotal), Number(numCuotas), primeraFecha),
    });
    onClose();
  };

  return (
    <Modal titulo="Añadir compra a plazos" onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <CampoTexto
          label="Nombre"
          placeholder="Sofá, portátil…"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />
        <div className="grid grid-cols-2 gap-3">
          <CampoTexto
            label="Importe total (€)"
            type="number"
            step="0.01"
            min="0"
            inputMode="decimal"
            value={montoTotal}
            onChange={(e) => setMontoTotal(e.target.value)}
            required
          />
          <CampoTexto
            label="Nº de cuotas"
            type="number"
            min="1"
            max="60"
            value={numCuotas}
            onChange={(e) => setNumCuotas(e.target.value)}
            required
          />
        </div>
        <CampoTexto
          label="Primera cuota"
          type="date"
          value={primeraFecha}
          onChange={(e) => setPrimeraFecha(e.target.value)}
          required
        />
        <CampoSelect label="Categoría" value={categoria} onChange={(e) => setCategoria(e.target.value)}>
          {CATEGORIAS.map((c) => (
            <option key={c.id} value={c.id}>
              {c.icono} {c.nombre}
            </option>
          ))}
        </CampoSelect>
        <BotonGuardar>Crear compra y sus cuotas</BotonGuardar>
      </form>
    </Modal>
  );
}

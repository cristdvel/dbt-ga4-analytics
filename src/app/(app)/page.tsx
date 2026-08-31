"use client";

import { useMemo, useState } from "react";
import { CompraForm } from "@/components/forms/compra-form";
import { GastoFijoForm } from "@/components/forms/gasto-fijo-form";
import { GastoVariableForm } from "@/components/forms/gasto-variable-form";
import { IngresoForm } from "@/components/forms/ingreso-form";
import { SaldoCard } from "@/components/saldo-card";
import { Seccion } from "@/components/seccion";
import { IngresoRow } from "@/components/ingreso-row";
import { GastoFijoRow } from "@/components/gasto-fijo-row";
import { CompraRow } from "@/components/compra-row";
import { GastoVariableRow } from "@/components/gasto-variable-row";
import { MonthSwitcher } from "@/components/month-switcher";
import { useToast } from "@/components/toast-provider";
import { calcularPendiente, claveMes, formatoMoneda } from "@/lib/finanzas";
import {
  mockCompras,
  mockGastoFijoPlantillas,
  mockGastoMesPorMes,
  mockGastosVariables,
  mockIngresosPorMes,
  mockMeses,
  type CompraVM,
  type GastoFijoPlantilla,
  type GastoMesVM,
  type GastoVariableVM,
  type IngresoVM,
} from "@/lib/mock-data";
import {
  calcularSaldosPorMes,
  cuotasDelMes,
  gastosVariablesDelMes,
  ingresosDelMes,
  resolverGastosMes,
} from "@/lib/selectors";

type Modal = "ingreso" | "gastoFijo" | "compra" | "gastoVariable" | null;

/**
 * Preview de la pantalla principal con datos de ejemplo y estado local
 * (checkboxes, expandir compra, modales, navegación entre meses). Sin
 * conexión a Supabase todavía — eso llega en el siguiente paso, junto con
 * auth. Entonces este componente pasa a ser server component con fetch
 * inicial + islas de cliente sólo para lo interactivo.
 */
export default function Home() {
  const mostrarToast = useToast();
  const [monthIndex, setMonthIndex] = useState(1); // agosto
  const [plantillas, setPlantillas] = useState<GastoFijoPlantilla[]>(mockGastoFijoPlantillas);
  const [gastoMesPorMes, setGastoMesPorMes] =
    useState<Record<string, GastoMesVM[]>>(mockGastoMesPorMes);
  const [compras, setCompras] = useState<CompraVM[]>(mockCompras);
  const [gastosVariables, setGastosVariables] = useState<GastoVariableVM[]>(mockGastosVariables);
  const [ingresosPorMes, setIngresosPorMes] =
    useState<Record<string, IngresoVM[]>>(mockIngresosPorMes);
  const [modalAbierto, setModalAbierto] = useState<Modal>(null);

  const mesActual = mockMeses[monthIndex];
  const claveActual = claveMes(mesActual.anio, mesActual.mes);
  const claveAnterior =
    monthIndex > 0 ? claveMes(mockMeses[monthIndex - 1].anio, mockMeses[monthIndex - 1].mes) : undefined;

  const gastosFijosMes = useMemo(
    () => resolverGastosMes(gastoMesPorMes, plantillas, claveActual, claveAnterior),
    [gastoMesPorMes, plantillas, claveActual, claveAnterior],
  );
  const cuotasMes = useMemo(
    () => cuotasDelMes(compras, mesActual.anio, mesActual.mes),
    [compras, mesActual.anio, mesActual.mes],
  );
  const gastosVariablesMes = useMemo(
    () => gastosVariablesDelMes(gastosVariables, mesActual.anio, mesActual.mes),
    [gastosVariables, mesActual.anio, mesActual.mes],
  );
  const ingresosMes = useMemo(
    () => ingresosDelMes(ingresosPorMes, claveActual),
    [ingresosPorMes, claveActual],
  );

  const saldosPorMes = useMemo(
    () =>
      calcularSaldosPorMes(
        mockMeses,
        gastoMesPorMes,
        plantillas,
        compras,
        gastosVariables,
        ingresosPorMes,
      ),
    [gastoMesPorMes, plantillas, compras, gastosVariables, ingresosPorMes],
  );
  const saldo = saldosPorMes[monthIndex];
  const pendiente = calcularPendiente({ gastosMes: gastosFijosMes, cuotas: cuotasMes });

  const avisarSaldoActualizado = (siguienteSaldo: number, deshacer: () => void) => {
    mostrarToast(`Saldo actualizado: ${formatoMoneda(siguienteSaldo)}`, {
      texto: "Deshacer",
      onClick: deshacer,
    });
  };

  const toggleGastoFijo = (id: string) => {
    const siguiente = {
      ...gastoMesPorMes,
      [claveActual]: gastoMesPorMes[claveActual].map((g) =>
        g.id === id ? { ...g, pagado: !g.pagado } : g,
      ),
    };
    setGastoMesPorMes(siguiente);
    const nuevoSaldo = calcularSaldosPorMes(
      mockMeses,
      siguiente,
      plantillas,
      compras,
      gastosVariables,
      ingresosPorMes,
    )[monthIndex];
    avisarSaldoActualizado(nuevoSaldo, () => toggleGastoFijo(id));
  };

  const toggleCuota = (compraId: string, cuotaId: string) => {
    const siguiente = compras.map((c) =>
      c.id !== compraId
        ? c
        : { ...c, cuotas: c.cuotas.map((cu) => (cu.id === cuotaId ? { ...cu, pagado: !cu.pagado } : cu)) },
    );
    setCompras(siguiente);
    const nuevoSaldo = calcularSaldosPorMes(
      mockMeses,
      gastoMesPorMes,
      plantillas,
      siguiente,
      gastosVariables,
      ingresosPorMes,
    )[monthIndex];
    avisarSaldoActualizado(nuevoSaldo, () => toggleCuota(compraId, cuotaId));
  };

  return (
    <div className="min-h-full bg-slate-950">
      <div className="mx-auto flex min-h-full max-w-md flex-col gap-6 px-4 pb-24 pt-6 md:max-w-2xl md:px-8 md:pb-10">
        <header className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-white">Finanzas Familiares</h1>
          <MonthSwitcher
            anio={mesActual.anio}
            mes={mesActual.mes}
            onPrev={() => setMonthIndex((i) => Math.max(0, i - 1))}
            onNext={() => setMonthIndex((i) => Math.min(mockMeses.length - 1, i + 1))}
            disablePrev={monthIndex === 0}
            disableNext={monthIndex === mockMeses.length - 1}
          />
        </header>

        <SaldoCard saldo={saldo} pendiente={pendiente} anio={mesActual.anio} mes={mesActual.mes} />

        <div className="grid gap-6 md:grid-cols-2">
          <Seccion
            titulo="Ingresos"
            total={formatoMoneda(ingresosMes.reduce((t, i) => t + i.monto, 0))}
            onAdd={() => setModalAbierto("ingreso")}
          >
            {ingresosMes.length === 0 && <EstadoVacio texto="Sin ingresos este mes" />}
            {ingresosMes.map((ingreso) => (
              <IngresoRow key={ingreso.id} {...ingreso} />
            ))}
          </Seccion>

          <Seccion titulo="Gastos fijos" total={formatoMoneda(pendiente)} onAdd={() => setModalAbierto("gastoFijo")}>
            {gastosFijosMes.length === 0 && <EstadoVacio texto="Sin gastos fijos este mes" />}
            {gastosFijosMes.map((gasto) => (
              <GastoFijoRow
                key={gasto.id}
                nombre={gasto.nombre}
                categoria={gasto.categoria}
                diaCobro={gasto.diaCobro}
                monto={gasto.monto}
                pagado={gasto.pagado}
                subioPorcentaje={gasto.subioPorcentaje}
                onToggle={() => toggleGastoFijo(gasto.id)}
              />
            ))}
          </Seccion>

          <Seccion titulo="Compras a plazos" onAdd={() => setModalAbierto("compra")}>
            {compras.length === 0 && <EstadoVacio texto="Sin compras a plazos" />}
            {compras.map((compra) => (
              <CompraRow
                key={compra.id}
                nombre={compra.nombre}
                categoria={compra.categoria}
                cuotas={compra.cuotas}
                onToggleCuota={(cuotaId) => toggleCuota(compra.id, cuotaId)}
              />
            ))}
          </Seccion>

          <Seccion
            titulo="Gastos variables"
            total={formatoMoneda(gastosVariablesMes.reduce((t, g) => t + g.monto, 0))}
            onAdd={() => setModalAbierto("gastoVariable")}
          >
            {gastosVariablesMes.length === 0 && <EstadoVacio texto="Sin gastos variables este mes" />}
            {gastosVariablesMes.map((gasto) => (
              <GastoVariableRow key={gasto.id} {...gasto} />
            ))}
          </Seccion>
        </div>
      </div>

      {modalAbierto === "ingreso" && (
        <IngresoForm
          onClose={() => setModalAbierto(null)}
          onGuardar={(ingreso) =>
            setIngresosPorMes((prev) => ({
              ...prev,
              [claveActual]: [...(prev[claveActual] ?? []), { ...ingreso, id: `ingreso-${Date.now()}` }],
            }))
          }
        />
      )}

      {modalAbierto === "gastoFijo" && (
        <GastoFijoForm
          onClose={() => setModalAbierto(null)}
          onGuardar={(datos) => {
            const nuevaPlantilla: GastoFijoPlantilla = {
              ...datos,
              id: `gf-${Date.now()}`,
              activo: true,
            };
            setPlantillas((prev) => [...prev, nuevaPlantilla]);
            setGastoMesPorMes((prev) => ({
              ...prev,
              [claveActual]: [
                ...(prev[claveActual] ?? []),
                { id: `gm-${Date.now()}`, gastoFijoId: nuevaPlantilla.id, monto: datos.monto, pagado: false },
              ],
            }));
          }}
        />
      )}

      {modalAbierto === "compra" && (
        <CompraForm
          onClose={() => setModalAbierto(null)}
          onGuardar={(compra) =>
            setCompras((prev) => [...prev, { ...compra, id: `compra-${Date.now()}` }])
          }
        />
      )}

      {modalAbierto === "gastoVariable" && (
        <GastoVariableForm
          onClose={() => setModalAbierto(null)}
          onGuardar={(gasto) =>
            setGastosVariables((prev) => [...prev, { ...gasto, id: `gv-${Date.now()}` }])
          }
        />
      )}
    </div>
  );
}

function EstadoVacio({ texto }: { texto: string }) {
  return <p className="px-4 py-6 text-center text-sm text-slate-500">{texto}</p>;
}

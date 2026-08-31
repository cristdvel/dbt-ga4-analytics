"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthCard } from "@/components/auth-card";
import { BotonGuardar, CampoTexto } from "@/components/modal";
import { createClient } from "@/lib/supabase/client";

/**
 * Primera vez que un usuario autenticado no pertenece a ningún household
 * (lo comprueba src/app/(app)/layout.tsx). Dos caminos: crear uno nuevo
 * (RPC create_household_with_owner, ver migración 20260831120000) o
 * unirse a uno existente pegando el código que le pasó su pareja.
 */
export default function HouseholdPage() {
  const router = useRouter();
  const [nombre, setNombre] = useState("Familia");
  const [codigo, setCodigo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState<"crear" | "unirse" | null>(null);
  const [householdCreado, setHouseholdCreado] = useState<{ id: string; nombre: string } | null>(null);
  const [copiado, setCopiado] = useState(false);

  const crearHousehold = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCargando("crear");

    const supabase = createClient();
    const { data, error: rpcError } = await supabase.rpc("create_household_with_owner", {
      p_nombre: nombre.trim() || "Familia",
    });

    setCargando(null);
    if (rpcError || !data) {
      setError(rpcError?.message ?? "No se pudo crear el household.");
      return;
    }
    setHouseholdCreado({ id: data.id, nombre: data.nombre });
  };

  const unirseHousehold = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCargando("unirse");

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Tu sesión ha caducado, vuelve a entrar.");
      setCargando(null);
      return;
    }

    const { error: insertError } = await supabase
      .from("household_member")
      .insert({ household_id: codigo.trim(), user_id: user.id });

    setCargando(null);
    if (insertError) {
      setError(
        insertError.code === "23503"
          ? "Ese código no existe. Revísalo con tu pareja."
          : insertError.message,
      );
      return;
    }

    router.replace("/");
    router.refresh();
  };

  const copiarCodigo = async () => {
    if (!householdCreado) return;
    await navigator.clipboard.writeText(householdCreado.id);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  if (householdCreado) {
    return (
      <AuthCard titulo="¡Listo!" subtitulo={`Se creó "${householdCreado.nombre}"`}>
        <p className="text-sm text-slate-300">
          Comparte este código con tu pareja para que se una desde su cuenta:
        </p>
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2">
          <code className="flex-1 overflow-x-auto text-xs text-emerald-400">{householdCreado.id}</code>
          <button
            type="button"
            onClick={copiarCodigo}
            className="shrink-0 rounded-lg bg-slate-700 px-2.5 py-1 text-xs font-medium text-slate-200 hover:bg-slate-600"
          >
            {copiado ? "Copiado ✓" : "Copiar"}
          </button>
        </div>
        <button
          type="button"
          onClick={() => {
            router.replace("/");
            router.refresh();
          }}
          className="mt-4 w-full rounded-xl bg-emerald-500 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
        >
          Continuar
        </button>
      </AuthCard>
    );
  }

  return (
    <AuthCard titulo="Un último paso" subtitulo="Crea tu household o únete a uno existente">
      <form onSubmit={crearHousehold} className="flex flex-col gap-3">
        <CampoTexto
          label="Nombre del household"
          placeholder="Familia"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
        <BotonGuardar disabled={cargando === "crear"}>
          {cargando === "crear" ? "Creando…" : "Crear household nuevo"}
        </BotonGuardar>
      </form>

      <div className="my-5 flex items-center gap-3 text-xs text-slate-500">
        <div className="h-px flex-1 bg-white/5" />o<div className="h-px flex-1 bg-white/5" />
      </div>

      <form onSubmit={unirseHousehold} className="flex flex-col gap-3">
        <CampoTexto
          label="Código de tu pareja"
          placeholder="Pega aquí el código que te pasaron"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          required
        />
        <button
          type="submit"
          disabled={cargando === "unirse"}
          className="w-full rounded-xl border border-slate-700 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {cargando === "unirse" ? "Uniéndome…" : "Unirme con el código"}
        </button>
      </form>

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
    </AuthCard>
  );
}

import { CATEGORIAS } from "@/lib/categorias";
import { Seccion } from "@/components/seccion";
import { NotificacionesToggle } from "@/components/notificaciones-toggle";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "./actions";

export default async function AjustesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: propiaMembresia } = await supabase
    .from("household_member")
    .select("household_id")
    .eq("user_id", user?.id ?? "")
    .limit(1)
    .single();

  const { data: miembros } = propiaMembresia
    ? await supabase
        .from("household_member")
        .select("user_id")
        .eq("household_id", propiaMembresia.household_id)
    : { data: null };

  const totalMiembros = miembros?.length ?? 1;

  return (
    <div className="min-h-full bg-slate-950">
      <div className="mx-auto flex min-h-full max-w-md flex-col gap-6 px-4 pb-24 pt-6 md:max-w-2xl md:px-8 md:pb-10">
        <header>
          <h1 className="text-lg font-semibold text-white">Ajustes</h1>
          <p className="mt-1 text-sm text-slate-400">Household, categorías y preferencias.</p>
        </header>

        <Seccion titulo="Household">
          <div className="flex items-center gap-3 border-b border-white/5 px-4 py-3 last:border-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-800 text-sm font-medium text-slate-300">
              {(user?.email ?? "?").charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-slate-200">Tú</p>
              <p className="truncate text-xs text-slate-500">{user?.email}</p>
            </div>
          </div>
          <p className="px-4 py-3 text-xs text-slate-500">
            {totalMiembros === 1
              ? "Todavía sois solo tú en este household — comparte el código de invitación con tu pareja."
              : `${totalMiembros} personas en este household.`}
          </p>
        </Seccion>

        <Seccion titulo="Notificaciones">
          <NotificacionesToggle />
        </Seccion>

        <Seccion titulo="Categorías">
          <div className="flex flex-wrap gap-2 p-4">
            {CATEGORIAS.map((c) => (
              <span
                key={c.id}
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
                style={{ backgroundColor: `${c.color}26`, color: c.color }}
              >
                <span aria-hidden>{c.icono}</span>
                {c.nombre}
              </span>
            ))}
          </div>
        </Seccion>

        <Seccion titulo="Datos">
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="text-sm text-slate-200">Exportar a CSV / Excel</p>
              <p className="text-xs text-slate-500">Ingresos, gastos y cuotas por rango de meses</p>
            </div>
            <button
              type="button"
              disabled
              className="rounded-full bg-slate-800 px-3 py-1.5 text-xs text-slate-500"
              title="Siguiente iteración"
            >
              Próximamente
            </button>
          </div>
        </Seccion>

        <form action={signOut}>
          <button
            type="submit"
            className="w-full rounded-2xl bg-slate-900 py-3 text-sm font-medium text-red-400 ring-1 ring-white/5 transition hover:bg-slate-800"
          >
            Cerrar sesión
          </button>
        </form>
      </div>
    </div>
  );
}

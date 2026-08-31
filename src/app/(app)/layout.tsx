import { redirect } from "next/navigation";
import { Nav } from "@/components/nav";
import { ToastProvider } from "@/components/toast-provider";
import { createClient } from "@/lib/supabase/server";

/**
 * Layout de las pantallas de la app (Inicio, Comparativa, Recurrentes,
 * Ajustes): exige sesión + household. proxy.ts ya bloquea el acceso sin
 * sesión, así que el chequeo de household es lo que aporta este layout —
 * y de paso es donde vive la barra de navegación, para que /login,
 * /signup y /household no la arrastren.
 */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: membership } = await supabase
    .from("household_member")
    .select("household_id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (!membership) redirect("/household");

  return (
    <ToastProvider>
      <Nav />
      <div className="flex-1 pb-16 md:pb-0 md:pl-56">{children}</div>
    </ToastProvider>
  );
}

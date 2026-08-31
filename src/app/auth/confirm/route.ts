import { type EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Destino del enlace de confirmación de email de Supabase Auth. El
 * template de email del proyecto debe apuntar aquí con `token_hash` y
 * `type` (Authentication > Email Templates en el dashboard de Supabase;
 * ver README para el `redirect_to` exacto).
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  if (token_hash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) {
      redirect("/household");
    }
  }

  redirect("/login?error=confirmacion");
}

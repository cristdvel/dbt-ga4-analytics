"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthCard } from "@/components/auth-card";
import { BotonGuardar, CampoTexto } from "@/components/modal";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const [emailEnviado, setEmailEnviado] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCargando(true);

    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/confirm` },
    });

    if (authError) {
      setError(
        authError.message === "User already registered"
          ? "Ya existe una cuenta con ese email. Entra desde el login."
          : authError.message,
      );
      setCargando(false);
      return;
    }

    if (data.session) {
      router.replace("/household");
      router.refresh();
      return;
    }

    // Proyecto con confirmación de email activada: no hay sesión todavía.
    setEmailEnviado(true);
    setCargando(false);
  };

  if (emailEnviado) {
    return (
      <AuthCard titulo="Revisa tu email" subtitulo="Te hemos enviado un enlace de confirmación">
        <p className="text-sm text-slate-300">
          Abre el correo que te acabamos de mandar a <span className="text-white">{email}</span> y toca el
          enlace para activar tu cuenta.
        </p>
        <Link href="/login" className="mt-4 block text-center text-sm font-medium text-emerald-400">
          Volver al login
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard titulo="Finanzas Familiares" subtitulo="Crea tu cuenta">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <CampoTexto
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <CampoTexto
          label="Contraseña"
          type="password"
          autoComplete="new-password"
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <BotonGuardar disabled={cargando}>{cargando ? "Creando cuenta…" : "Crear cuenta"}</BotonGuardar>
      </form>
      <p className="mt-4 text-center text-sm text-slate-400">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-medium text-emerald-400">
          Entra
        </Link>
      </p>
    </AuthCard>
  );
}

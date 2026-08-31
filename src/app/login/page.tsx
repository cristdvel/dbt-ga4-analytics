"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthCard } from "@/components/auth-card";
import { BotonGuardar, CampoTexto } from "@/components/modal";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCargando(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError(
        authError.message === "Invalid login credentials"
          ? "Email o contraseña incorrectos."
          : authError.message,
      );
      setCargando(false);
      return;
    }

    router.replace("/");
    router.refresh();
  };

  return (
    <AuthCard titulo="Finanzas Familiares" subtitulo="Entra con tu cuenta">
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
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <BotonGuardar disabled={cargando}>{cargando ? "Entrando…" : "Entrar"}</BotonGuardar>
      </form>
      <p className="mt-4 text-center text-sm text-slate-400">
        ¿Primera vez?{" "}
        <Link href="/signup" className="font-medium text-emerald-400">
          Crea una cuenta
        </Link>
      </p>
    </AuthCard>
  );
}

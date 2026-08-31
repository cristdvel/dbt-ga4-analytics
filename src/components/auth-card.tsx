export function AuthCard({
  titulo,
  subtitulo,
  children,
}: {
  titulo: string;
  subtitulo: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center bg-slate-950 px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <span className="text-2xl" aria-hidden>
            €
          </span>
          <h1 className="mt-2 text-lg font-semibold text-white">{titulo}</h1>
          <p className="mt-1 text-sm text-slate-400">{subtitulo}</p>
        </div>
        <div className="rounded-3xl bg-slate-900 p-6 ring-1 ring-white/5">{children}</div>
      </div>
    </div>
  );
}

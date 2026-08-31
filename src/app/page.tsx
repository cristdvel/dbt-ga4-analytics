export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-zinc-50 px-6 text-center dark:bg-black">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Finanzas Familiares
      </h1>
      <p className="max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
        Scaffold en construcción. La pantalla principal (saldo, ingresos,
        gastos fijos y compras) llega en el siguiente paso.
      </p>
    </div>
  );
}

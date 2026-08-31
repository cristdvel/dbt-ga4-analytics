export function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-400">
      {children}
    </span>
  );
}

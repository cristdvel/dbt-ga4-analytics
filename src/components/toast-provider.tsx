"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";

interface ToastState {
  id: number;
  mensaje: string;
}

const ToastContext = createContext<((mensaje: string) => void) | null>(null);

export function useToast() {
  const show = useContext(ToastContext);
  if (!show) throw new Error("useToast debe usarse dentro de <ToastProvider>");
  return show;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((mensaje: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    const id = Date.now();
    setToast({ id, mensaje });
    timeoutRef.current = setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current));
    }, 2800);
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-20 z-50 flex justify-center px-4 md:bottom-6"
      >
        {toast && (
          <div className="pointer-events-auto flex items-center gap-2 rounded-full bg-slate-800 px-4 py-2 text-sm text-slate-100 shadow-lg shadow-black/30 ring-1 ring-white/10">
            <span aria-hidden className="text-emerald-400">
              ●
            </span>
            {toast.mensaje}
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
}

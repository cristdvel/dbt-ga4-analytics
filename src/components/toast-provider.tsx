"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";

interface ToastAccion {
  texto: string;
  onClick: () => void;
}

interface ToastState {
  id: number;
  mensaje: string;
  accion?: ToastAccion;
}

type MostrarToast = (mensaje: string, accion?: ToastAccion) => void;

const ToastContext = createContext<MostrarToast | null>(null);

export function useToast() {
  const show = useContext(ToastContext);
  if (!show) throw new Error("useToast debe usarse dentro de <ToastProvider>");
  return show;
}

const DURACION_MS = 4000;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const ocultar = useCallback((id: number) => {
    setToast((current) => (current?.id === id ? null : current));
  }, []);

  const show = useCallback<MostrarToast>((mensaje, accion) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    const id = Date.now();
    setToast({ id, mensaje, accion });
    timeoutRef.current = setTimeout(() => ocultar(id), DURACION_MS);
  }, [ocultar]);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-20 z-50 flex justify-center px-4 md:bottom-6"
      >
        {toast && (
          <div className="pointer-events-auto flex items-center gap-3 rounded-full bg-slate-800 py-2 pl-4 pr-2 text-sm text-slate-100 shadow-lg shadow-black/30 ring-1 ring-white/10">
            <span className="flex items-center gap-2">
              <span aria-hidden className="text-emerald-400">
                ●
              </span>
              {toast.mensaje}
            </span>
            {toast.accion && (
              <button
                type="button"
                onClick={() => {
                  toast.accion?.onClick();
                  ocultar(toast.id);
                }}
                className="rounded-full bg-slate-700 px-3 py-1 text-xs font-semibold text-emerald-400 transition hover:bg-slate-600"
              >
                {toast.accion.texto}
              </button>
            )}
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
}

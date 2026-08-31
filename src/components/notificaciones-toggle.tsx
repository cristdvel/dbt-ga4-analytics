"use client";

import { useState } from "react";
import { ToggleSwitch } from "@/components/toggle-switch";

export function NotificacionesToggle() {
  const [activo, setActivo] = useState(true);

  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div>
        <p className="text-sm text-slate-200">Recordatorios de cobro</p>
        <p className="text-xs text-slate-500">Push el día antes y el día del cobro</p>
      </div>
      <ToggleSwitch checked={activo} onChange={() => setActivo((v) => !v)} label="Recordatorios de cobro" />
    </div>
  );
}

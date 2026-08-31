/**
 * Tipos manuales que reflejan supabase/migrations/. Si más adelante se usa
 * `supabase gen types typescript`, este archivo puede sustituirse por el
 * generado sin cambiar las importaciones (`@/lib/types/database`).
 *
 * IMPORTANTE: las filas van como `type`, no `interface` — con
 * @supabase/supabase-js@2.112+ un `interface` para Row/Insert/Update hace
 * que el chequeo de `GenericSchema` de postgrest-js no lo reconozca y todo
 * el resultado de la consulta degenera a `never` en tiempo de compilación
 * (comprobado de forma aislada). Mismo problema con `Database` en sí.
 */

export type TipoIngreso = "fijo" | "extra";

export type TipoNotificacion =
  | "recordatorio_previo"
  | "recordatorio_dia"
  | "balance_actualizado"
  | "gasto_subio";

export type Mes = {
  id: string;
  household_id: string;
  anio: number;
  mes: number;
  saldo_inicial: number;
};

export type Ingreso = {
  id: string;
  mes_id: string;
  nombre: string;
  monto: number;
  tipo: TipoIngreso;
};

export type GastoFijo = {
  id: string;
  household_id: string;
  nombre: string;
  monto: number;
  dia_cobro: number;
  categoria: string;
  activo: boolean;
};

export type GastoMes = {
  id: string;
  mes_id: string;
  gasto_fijo_id: string;
  monto: number;
  pagado: boolean;
  fecha_marcado: string | null;
  marcado_por: string | null;
};

export type Compra = {
  id: string;
  household_id: string;
  nombre: string;
  monto_total: number;
  categoria: string;
};

export type Cuota = {
  id: string;
  compra_id: string;
  numero: number;
  monto: number;
  fecha_cobro: string;
  pagado: boolean;
  fecha_marcado: string | null;
  marcado_por: string | null;
};

export type GastoVariable = {
  id: string;
  mes_id: string;
  nombre: string;
  monto: number;
  categoria: string;
  fecha: string;
  marcado_por: string | null;
};

export type Notificacion = {
  id: string;
  referencia_id: string;
  tipo: TipoNotificacion;
  programada_para: string;
  enviada: boolean;
};

export type PushSubscriptionRow = {
  id: string;
  household_id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  created_at: string;
};

export type Household = {
  id: string;
  nombre: string;
  created_at: string;
};

export type HouseholdMember = {
  household_id: string;
  user_id: string;
  created_at: string;
};

/** Atajo para declarar una tabla sin relaciones FK expuestas al query builder de PostgREST. */
type Tabla<Row, Insert = Partial<Row>, Update = Partial<Row>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type Database = {
  // Requerido por @supabase/supabase-js >=2.112 para resolver los tipos de
  // consulta. Debe coincidir con la versión de PostgREST del proyecto
  // Supabase (Settings > Infrastructure en el dashboard).
  __InternalSupabase: {
    PostgrestVersion: "12";
  };
  public: {
    Tables: {
      household: Tabla<Household>;
      household_member: Tabla<HouseholdMember>;
      mes: Tabla<Mes>;
      ingreso: Tabla<Ingreso>;
      gasto_fijo: Tabla<GastoFijo>;
      gasto_mes: Tabla<GastoMes>;
      compra: Tabla<Compra>;
      cuota: Tabla<Cuota>;
      gasto_variable: Tabla<GastoVariable>;
      notificacion: Tabla<Notificacion>;
      push_subscription: Tabla<PushSubscriptionRow>;
    };
    Views: Record<string, never>;
    Functions: {
      create_household_with_owner: {
        Args: { p_nombre?: string };
        Returns: Household;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

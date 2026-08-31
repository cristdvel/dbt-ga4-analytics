/**
 * Tipos manuales que reflejan supabase/migrations/. Si más adelante se usa
 * `supabase gen types typescript`, este archivo puede sustituirse por el
 * generado sin cambiar las importaciones (`@/lib/types/database`).
 */

export type TipoIngreso = "fijo" | "extra";

export type TipoNotificacion =
  | "recordatorio_previo"
  | "recordatorio_dia"
  | "balance_actualizado"
  | "gasto_subio";

export interface Mes {
  id: string;
  household_id: string;
  anio: number;
  mes: number;
  saldo_inicial: number;
}

export interface Ingreso {
  id: string;
  mes_id: string;
  nombre: string;
  monto: number;
  tipo: TipoIngreso;
}

export interface GastoFijo {
  id: string;
  household_id: string;
  nombre: string;
  monto: number;
  dia_cobro: number;
  categoria: string;
  activo: boolean;
}

export interface GastoMes {
  id: string;
  mes_id: string;
  gasto_fijo_id: string;
  monto: number;
  pagado: boolean;
  fecha_marcado: string | null;
  marcado_por: string | null;
}

export interface Compra {
  id: string;
  household_id: string;
  nombre: string;
  monto_total: number;
  categoria: string;
}

export interface Cuota {
  id: string;
  compra_id: string;
  numero: number;
  monto: number;
  fecha_cobro: string;
  pagado: boolean;
  fecha_marcado: string | null;
  marcado_por: string | null;
}

export interface GastoVariable {
  id: string;
  mes_id: string;
  nombre: string;
  monto: number;
  categoria: string;
  fecha: string;
  marcado_por: string | null;
}

export interface Notificacion {
  id: string;
  referencia_id: string;
  tipo: TipoNotificacion;
  programada_para: string;
  enviada: boolean;
}

export interface PushSubscriptionRow {
  id: string;
  household_id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  created_at: string;
}

export interface Household {
  id: string;
  nombre: string;
  created_at: string;
}

export interface HouseholdMember {
  household_id: string;
  user_id: string;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      household: { Row: Household; Insert: Partial<Household>; Update: Partial<Household> };
      household_member: {
        Row: HouseholdMember;
        Insert: Partial<HouseholdMember>;
        Update: Partial<HouseholdMember>;
      };
      mes: { Row: Mes; Insert: Partial<Mes>; Update: Partial<Mes> };
      ingreso: { Row: Ingreso; Insert: Partial<Ingreso>; Update: Partial<Ingreso> };
      gasto_fijo: { Row: GastoFijo; Insert: Partial<GastoFijo>; Update: Partial<GastoFijo> };
      gasto_mes: { Row: GastoMes; Insert: Partial<GastoMes>; Update: Partial<GastoMes> };
      compra: { Row: Compra; Insert: Partial<Compra>; Update: Partial<Compra> };
      cuota: { Row: Cuota; Insert: Partial<Cuota>; Update: Partial<Cuota> };
      gasto_variable: {
        Row: GastoVariable;
        Insert: Partial<GastoVariable>;
        Update: Partial<GastoVariable>;
      };
      notificacion: {
        Row: Notificacion;
        Insert: Partial<Notificacion>;
        Update: Partial<Notificacion>;
      };
      push_subscription: {
        Row: PushSubscriptionRow;
        Insert: Partial<PushSubscriptionRow>;
        Update: Partial<PushSubscriptionRow>;
      };
    };
  };
}

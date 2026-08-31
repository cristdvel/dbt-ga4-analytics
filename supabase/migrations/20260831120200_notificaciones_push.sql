-- Tablas para la siguiente iteración (push notifications), creadas ya para
-- no tener que tocar el esquema más adelante.
--
-- Desviación respecto al esquema pedido: se añade household_id a
-- "notificacion". referencia_id es polimórfico (puede apuntar a gasto_fijo,
-- gasto_mes o cuota según "tipo") y sin household_id no hay forma de que
-- RLS sepa a quién pertenece la fila.

create table notificacion (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references household(id) on delete cascade,
  referencia_id uuid not null,
  tipo text not null check (tipo in ('recordatorio_previo', 'recordatorio_dia', 'balance_actualizado', 'gasto_subio')),
  programada_para timestamptz not null,
  enviada boolean not null default false
);

create index notificacion_household_id_idx on notificacion(household_id);
create index notificacion_pendientes_idx on notificacion(programada_para) where not enviada;

-- Suscripción Web Push por dispositivo (un usuario puede tener varios).
create table push_subscription (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references household(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

create index push_subscription_household_id_idx on push_subscription(household_id);

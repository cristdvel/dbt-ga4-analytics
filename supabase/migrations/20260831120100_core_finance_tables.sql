-- Esquema principal tal como se especificó, con FKs a auth.users(id) para
-- los campos "marcado_por" e índices para las consultas de la app.

create table mes (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references household(id) on delete cascade,
  anio int not null,
  mes int not null check (mes between 1 and 12),
  saldo_inicial numeric not null default 0,
  unique (household_id, anio, mes)
);

create index mes_household_id_idx on mes(household_id);

create table ingreso (
  id uuid primary key default gen_random_uuid(),
  mes_id uuid not null references mes(id) on delete cascade,
  nombre text not null,
  monto numeric not null,
  tipo text not null check (tipo in ('fijo', 'extra'))
);

create index ingreso_mes_id_idx on ingreso(mes_id);

create table gasto_fijo (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references household(id) on delete cascade,
  nombre text not null,
  monto numeric not null,
  dia_cobro int not null check (dia_cobro between 1 and 31),
  categoria text not null,
  activo boolean not null default true
);

create index gasto_fijo_household_id_idx on gasto_fijo(household_id);
create index gasto_fijo_dia_cobro_idx on gasto_fijo(dia_cobro) where activo;

create table gasto_mes (
  id uuid primary key default gen_random_uuid(),
  mes_id uuid not null references mes(id) on delete cascade,
  gasto_fijo_id uuid not null references gasto_fijo(id),
  monto numeric not null,
  pagado boolean not null default false,
  fecha_marcado timestamptz,
  marcado_por uuid references auth.users(id)
);

create index gasto_mes_mes_id_idx on gasto_mes(mes_id);
create index gasto_mes_gasto_fijo_id_idx on gasto_mes(gasto_fijo_id);

create table compra (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references household(id) on delete cascade,
  nombre text not null,
  monto_total numeric not null,
  categoria text not null
);

create index compra_household_id_idx on compra(household_id);

create table cuota (
  id uuid primary key default gen_random_uuid(),
  compra_id uuid not null references compra(id) on delete cascade,
  numero int not null,
  monto numeric not null,
  fecha_cobro date not null,
  pagado boolean not null default false,
  fecha_marcado timestamptz,
  marcado_por uuid references auth.users(id)
);

create index cuota_compra_id_idx on cuota(compra_id);
create index cuota_fecha_cobro_idx on cuota(fecha_cobro) where not pagado;

create table gasto_variable (
  id uuid primary key default gen_random_uuid(),
  mes_id uuid not null references mes(id) on delete cascade,
  nombre text not null,
  monto numeric not null,
  categoria text not null,
  fecha date not null,
  marcado_por uuid references auth.users(id)
);

create index gasto_variable_mes_id_idx on gasto_variable(mes_id);

-- Household: agrupa a los usuarios que comparten finanzas (v1: 2 personas).
-- No está en el esquema pedido por el usuario tal cual, pero es la pieza
-- mínima necesaria para que "household_id" tenga dueños reales y las
-- políticas RLS puedan resolver "¿este usuario pertenece a este household?".

create table household (
  id uuid primary key default gen_random_uuid(),
  nombre text not null default 'Familia',
  created_at timestamptz not null default now()
);

create table household_member (
  household_id uuid not null references household(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (household_id, user_id)
);

create index household_member_user_id_idx on household_member(user_id);

-- security definer: evita recursión de RLS al consultar household_member
-- desde las políticas de las demás tablas.
create or replace function is_household_member(hh_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from household_member hm
    where hm.household_id = hh_id
      and hm.user_id = auth.uid()
  );
$$;

-- Crea un household nuevo y hace miembro al usuario que llama (bootstrap:
-- sin esto no se puede insertar en household_member cumpliendo su propia
-- política RLS, porque el household aún no tendría ningún miembro).
create or replace function create_household_with_owner(p_nombre text default 'Familia')
returns household
language plpgsql
security definer
set search_path = public
as $$
declare
  v_household household;
begin
  insert into household (nombre) values (coalesce(p_nombre, 'Familia'))
  returning * into v_household;

  insert into household_member (household_id, user_id)
  values (v_household.id, auth.uid());

  return v_household;
end;
$$;

alter table household enable row level security;
alter table household_member enable row level security;

create policy "household: miembros pueden ver su household"
  on household for select
  using (is_household_member(id));

create policy "household: miembros pueden actualizar su household"
  on household for update
  using (is_household_member(id))
  with check (is_household_member(id));

create policy "household_member: miembros pueden ver quién más hay"
  on household_member for select
  using (is_household_member(household_id));

create policy "household_member: unirse a sí mismo o invitar a otro miembro"
  on household_member for insert
  with check (
    user_id = auth.uid()
    or is_household_member(household_id)
  );

create policy "household_member: salir del household"
  on household_member for delete
  using (user_id = auth.uid());

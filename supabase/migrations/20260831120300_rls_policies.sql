-- RLS: cualquier miembro del household puede leer/escribir los datos del
-- household (sin distinción de roles — v1 es de confianza entre los dos
-- usuarios). Todas las tablas sin household_id directo lo resuelven vía
-- join (mes_id -> mes.household_id, compra_id -> compra.household_id).

alter table mes enable row level security;
alter table ingreso enable row level security;
alter table gasto_fijo enable row level security;
alter table gasto_mes enable row level security;
alter table compra enable row level security;
alter table cuota enable row level security;
alter table gasto_variable enable row level security;
alter table notificacion enable row level security;
alter table push_subscription enable row level security;

-- mes
create policy "mes: acceso de miembros del household"
  on mes for all
  using (is_household_member(household_id))
  with check (is_household_member(household_id));

-- ingreso (via mes)
create policy "ingreso: acceso de miembros del household"
  on ingreso for all
  using (
    exists (
      select 1 from mes m
      where m.id = ingreso.mes_id
        and is_household_member(m.household_id)
    )
  )
  with check (
    exists (
      select 1 from mes m
      where m.id = ingreso.mes_id
        and is_household_member(m.household_id)
    )
  );

-- gasto_fijo
create policy "gasto_fijo: acceso de miembros del household"
  on gasto_fijo for all
  using (is_household_member(household_id))
  with check (is_household_member(household_id));

-- gasto_mes (via mes)
create policy "gasto_mes: acceso de miembros del household"
  on gasto_mes for all
  using (
    exists (
      select 1 from mes m
      where m.id = gasto_mes.mes_id
        and is_household_member(m.household_id)
    )
  )
  with check (
    exists (
      select 1 from mes m
      where m.id = gasto_mes.mes_id
        and is_household_member(m.household_id)
    )
  );

-- compra
create policy "compra: acceso de miembros del household"
  on compra for all
  using (is_household_member(household_id))
  with check (is_household_member(household_id));

-- cuota (via compra)
create policy "cuota: acceso de miembros del household"
  on cuota for all
  using (
    exists (
      select 1 from compra c
      where c.id = cuota.compra_id
        and is_household_member(c.household_id)
    )
  )
  with check (
    exists (
      select 1 from compra c
      where c.id = cuota.compra_id
        and is_household_member(c.household_id)
    )
  );

-- gasto_variable (via mes)
create policy "gasto_variable: acceso de miembros del household"
  on gasto_variable for all
  using (
    exists (
      select 1 from mes m
      where m.id = gasto_variable.mes_id
        and is_household_member(m.household_id)
    )
  )
  with check (
    exists (
      select 1 from mes m
      where m.id = gasto_variable.mes_id
        and is_household_member(m.household_id)
    )
  );

-- notificacion
create policy "notificacion: acceso de miembros del household"
  on notificacion for all
  using (is_household_member(household_id))
  with check (is_household_member(household_id));

-- push_subscription: cada quien gestiona sus propias suscripciones, pero
-- cualquier miembro del household puede verlas (para depurar/gestionar
-- dispositivos en pareja).
create policy "push_subscription: leer las del household"
  on push_subscription for select
  using (is_household_member(household_id));

create policy "push_subscription: crear la propia"
  on push_subscription for insert
  with check (user_id = auth.uid() and is_household_member(household_id));

create policy "push_subscription: borrar la propia"
  on push_subscription for delete
  using (user_id = auth.uid());

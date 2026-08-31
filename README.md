# Finanzas Familiares

PWA de gestión de finanzas personales/familiares (ingresos, gastos fijos,
compras a plazos, gastos variables). Uso personal en v1, pensada para poder
evolucionar a producto multi-household más adelante.

## Stack

- [Next.js 16](https://nextjs.org) (App Router) + TypeScript
- [Supabase](https://supabase.com) (Postgres + Auth + Row Level Security)
- Tailwind CSS 4
- [@ducanh2912/next-pwa](https://github.com/DuCanhGH/next-pwa) para instalabilidad (manifest + service worker)

> Next.js 16 usa Turbopack por defecto. `next-pwa` inyecta un plugin de
> webpack para generar el service worker, así que `dev`/`build` fuerzan
> `--webpack` explícitamente (ver `package.json`). El PWA está desactivado
> en `next dev` (`disable: NODE_ENV === "development"` en `next.config.ts`);
> para probar el service worker hay que compilar con `npm run build && npm start`.

## Puesta en marcha

```bash
npm install
cp .env.local.example .env.local   # rellenar con las credenciales de tu proyecto Supabase
npm run dev
```

### Base de datos

Las migraciones viven en `supabase/migrations/` y se aplican con la
[Supabase CLI](https://supabase.com/docs/guides/cli):

```bash
supabase link --project-ref <tu-project-ref>
supabase db push
```

O pegando el contenido de cada archivo, en orden, en el SQL Editor del
dashboard de Supabase.

Modelo de datos: `household`/`household_member` agrupan a los usuarios que
comparten finanzas; el resto de tablas (`mes`, `ingreso`, `gasto_fijo`,
`gasto_mes`, `compra`, `cuota`, `gasto_variable`) cuelgan de un
`household_id`. RLS está activo en todas las tablas: cualquier miembro del
household puede leer y escribir sus datos (sin roles — pensado para dos
personas de confianza). `notificacion` y `push_subscription` ya están
creadas para la siguiente iteración (Web Push).

> `src/lib/types/database.ts` declara las filas con `type`, no `interface`.
> Con `@supabase/supabase-js@2.112+` un `interface` para `Row`/`Insert`/
> `Update` hace que el chequeo interno de `GenericSchema` de postgrest-js no
> lo reconozca y el resultado de cualquier query degenera a `never` en
> tiempo de compilación — comprobado de forma aislada. Si se regeneran los
> tipos con `supabase gen types typescript`, el output ya usa `type` y no
> hace falta tocar nada.

### Auth (Supabase)

Email/password con `@supabase/ssr`. En el dashboard de Supabase
(**Authentication**):

- **URL Configuration** → añade `http://localhost:3000/auth/confirm` (y la
  URL de producción cuando exista) a *Redirect URLs*.
- Si quieres probar sin verificar email en local, desactiva **Confirm
  email** en *Providers > Email* — si lo dejas activo, el flujo de
  `/signup` ya maneja el estado "revisa tu email" y `/auth/confirm`
  procesa el enlace de confirmación.

Flujo: `/login` y `/signup` (Supabase Auth) → si el usuario no pertenece a
ningún `household` (comprobado en `src/app/(app)/layout.tsx`), se le manda
a `/household` para crear uno nuevo (RPC `create_household_with_owner`) o
unirse a uno existente pegando su UUID — el "código" que comparte con su
pareja. Sin invitación por email todavía (necesitaría la Admin API con
`service_role`, fuera de alcance de v1).

## Estado

- [x] Scaffold (Next.js + TS + Tailwind + cliente Supabase + PWA instalable)
- [x] Migraciones SQL + RLS
- [x] Pantalla principal (saldo, ingresos, gastos fijos, compras) + Comparativa, Recurrentes, Ajustes
- [x] Auth (login/registro) y alta/unión de household compartido
- [ ] Conectar las pantallas a Supabase de verdad (hoy usan mock-data en memoria)
- [ ] Notificaciones push (Service Worker + Web Push + cron)
- [ ] Export CSV/Excel

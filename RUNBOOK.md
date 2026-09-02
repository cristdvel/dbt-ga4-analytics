# Runbook — dbt + GA4 en BigQuery

Proyecto: modelar el export público de GA4 (Google Merchandise Store) en
BigQuery con dbt. Grano final: sesiones, compras y usuarios.

- **Source:** `bigquery-public-data.ga4_obfuscated_sample_ecommerce.events_*`
  (~4,3M eventos, 2020-11-01 → 2021-01-31)
- **Proyecto GCP:** `dbt-ga4-portfolio` · **dataset destino:** `dbt_cristhian` (US)
- **Repo:** `dbt-ga4-analytics` · **profile/proyecto dbt:** `ga4_analytics`

---

## 0. Decisiones técnicas (para el README luego)

| Decisión | Qué se hizo | Por qué |
|---|---|---|
| **Región** | dataset destino en `US` multi-region | El dataset público vive en US; BigQuery no hace join entre regiones. |
| **Sesionización** | `session_key = user_pseudo_id + '-' + ga_session_id` | Es el grano de sesión nativo de GA4; `ga_session_id` no es único entre usuarios, por eso se prefija con `user_pseudo_id`. |
| **Atribución** | session-scoped desde el evento `session_start`; user-scoped desde `traffic_source.*` (first touch) | GA4 expone las dos; se modelan por separado para no mezclarlas. |
| **Deduplicación de compras** | `row_number() over (partition by transaction_id order by purchased_at) = 1` | GA4 reenvía `purchase` si el usuario recarga la página de confirmación. |
| **Coste** | staging acotado por `_table_suffix` entre dos `vars` de fecha | Evita escanear tablas fuera del rango del sample; mantiene el gasto bajo la alerta de 1 €. |
| **Materialización** | staging = `view`, marts = `table` | Staging es lógica barata de aplanado; los marts se consultan repetido y compensa persistirlos. |
| **Permisos** | service account `dbt-user` con `BigQuery Admin` en el proyecto propio; lectura del público es pública | dbt necesita crear datasets/tablas en `dbt-ga4-portfolio`; no necesita permisos sobre `bigquery-public-data`. |

---

## 1. Entorno de trabajo (dbt Core local)

Python del sistema es 3.14 — demasiado nuevo para dbt (soporta 3.9–3.12).
Se usa `uv` para crear un entorno aislado con 3.12.

```powershell
# 1. Instalar uv
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
# cerrar y reabrir la terminal para que uv entre en PATH

# 2. Clonar el repo (o git init + remote si la carpeta ya existe)
cd C:\Users\User\Documents\GitHub
git clone https://github.com/<usuario>/dbt-ga4-analytics.git
cd dbt-ga4-analytics

# 3. Entorno virtual con Python 3.12 + dbt
uv venv --python 3.12
.venv\Scripts\activate
uv pip install "dbt-core~=1.9.0" "dbt-bigquery~=1.9.0"

dbt --version   # comprobar que responde
```

### Mover la key fuera del repo

La service account JSON **nunca** se commitea. Fuera del árbol del repo:

```powershell
mkdir C:\Users\User\.dbt -Force
move C:\Users\User\Documents\GitHub\DBT\dbt-ga4-portfolio-3aab510cd1f5.json `
     C:\Users\User\.dbt\dbt-ga4-portfolio.json
```

### Estructura de carpetas del proyecto

```
dbt-ga4-analytics/
├── dbt_project.yml
├── packages.yml
├── .gitignore
├── README.md
└── models/
    ├── staging/
    │   └── ga4/
    │       ├── _ga4__sources.yml
    │       ├── _ga4__models.yml
    │       └── stg_ga4__events.sql
    └── marts/
        ├── _marts__models.yml
        ├── fct_sessions.sql
        ├── fct_purchases.sql
        └── dim_users.sql
```

---

## 2. Ficheros de configuración

### `~/.dbt/profiles.yml` (fuera del repo)

```yaml
ga4_analytics:
  target: dev
  outputs:
    dev:
      type: bigquery
      method: service-account
      project: dbt-ga4-portfolio
      dataset: dbt_cristhian
      keyfile: "C:/Users/User/.dbt/dbt-ga4-portfolio.json"
      location: US
      threads: 4
      job_execution_timeout_seconds: 300
      job_retries: 1
      priority: interactive
```

### `dbt_project.yml`

```yaml
name: 'ga4_analytics'
version: '1.0.0'
config-version: 2

profile: 'ga4_analytics'

model-paths: ["models"]
test-paths: ["tests"]
macro-paths: ["macros"]
seed-paths: ["seeds"]
snapshot-paths: ["snapshots"]

clean-targets:
  - "target"
  - "dbt_packages"

vars:
  ga4_start_date: '20201101'
  ga4_end_date: '20210131'

models:
  ga4_analytics:
    staging:
      +materialized: view
    marts:
      +materialized: table
```

### `packages.yml`

```yaml
packages:
  - package: dbt-labs/dbt_utils
    version: [">=1.1.0", "<2.0.0"]
```

### `.gitignore`

```gitignore
target/
dbt_packages/
logs/
*.log
.user.yml
.venv/
# credenciales — nunca al repo
*.json
!docs/*.json
profiles.yml
```

---

## 3. Source

### `models/staging/ga4/_ga4__sources.yml`

```yaml
version: 2

sources:
  - name: ga4
    description: >
      Export de GA4 a BigQuery — muestra ofuscada de la Google
      Merchandise Store (dataset público).
    database: bigquery-public-data
    schema: ga4_obfuscated_sample_ecommerce
    tables:
      - name: events
        identifier: events_*
        description: Tablas diarias event_YYYYMMDD, nov 2020 – ene 2021.
```

---

## 4. `stg_ga4__events` (staging, view)

Un registro por evento. Aplana los `event_params` relevantes, expone
`ecommerce` y device/geo, y construye `session_key`.

### `models/staging/ga4/stg_ga4__events.sql`

```sql
{{ config(materialized='view') }}

with source as (

    select *
    from {{ source('ga4', 'events') }}
    where _table_suffix between '{{ var("ga4_start_date") }}'
                           and '{{ var("ga4_end_date") }}'

),

flattened as (

    select
        -- identificadores
        user_pseudo_id,
        user_id,
        (select value.int_value from unnest(event_params) where key = 'ga_session_id')      as ga_session_id,
        (select value.int_value from unnest(event_params) where key = 'ga_session_number')  as ga_session_number,

        -- evento
        event_name,
        timestamp_micros(event_timestamp)                                                   as event_timestamp,
        parse_date('%Y%m%d', event_date)                                                    as event_date,
        event_bundle_sequence_id,

        -- contexto de página
        (select value.string_value from unnest(event_params) where key = 'page_location')   as page_location,
        (select value.string_value from unnest(event_params) where key = 'page_title')      as page_title,
        (select value.string_value from unnest(event_params) where key = 'page_referrer')   as page_referrer,

        -- engagement
        coalesce(
            (select value.string_value from unnest(event_params) where key = 'session_engaged'),
            cast((select value.int_value from unnest(event_params) where key = 'session_engaged') as string)
        )                                                                                   as session_engaged,
        (select value.int_value from unnest(event_params) where key = 'engagement_time_msec') as engagement_time_msec,

        -- tráfico session-scoped (event_params)
        (select value.string_value from unnest(event_params) where key = 'source')          as event_source,
        (select value.string_value from unnest(event_params) where key = 'medium')          as event_medium,
        (select value.string_value from unnest(event_params) where key = 'campaign')        as event_campaign,

        -- tráfico user-scoped (first touch)
        traffic_source.source                                                               as user_first_source,
        traffic_source.medium                                                               as user_first_medium,
        traffic_source.name                                                                 as user_first_campaign,

        -- ecommerce (poblado en purchase / refund)
        ecommerce.transaction_id                                                            as transaction_id,
        ecommerce.purchase_revenue_in_usd                                                   as purchase_revenue_usd,
        ecommerce.total_item_quantity                                                       as total_item_quantity,
        ecommerce.unique_items                                                              as unique_items,

        -- device / geo
        device.category                                                                    as device_category,
        device.operating_system                                                            as device_os,
        device.web_info.browser                                                             as browser,
        geo.country                                                                         as country,
        geo.region                                                                          as region,
        geo.city                                                                            as city

    from source

)

select
    concat(user_pseudo_id, '-', cast(ga_session_id as string)) as session_key,
    *
from flattened
```

### `models/staging/ga4/_ga4__models.yml`

```yaml
version: 2

models:
  - name: stg_ga4__events
    description: >
      Un registro por evento GA4. Aplana los event_params clave, expone
      ecommerce y device/geo, y construye session_key
      (user_pseudo_id + ga_session_id). Materializado como view.
    columns:
      - name: event_timestamp
        description: Momento del evento en UTC (precisión microsegundo).
        data_tests: [not_null]
      - name: event_name
        data_tests: [not_null]
      - name: user_pseudo_id
        data_tests: [not_null]
      - name: session_key
        description: >
          user_pseudo_id + '-' + ga_session_id. Null en eventos sin
          ga_session_id (p. ej. algunos eventos de ciclo de vida).
      - name: device_category
        data_tests:
          - accepted_values:
              values: ['desktop', 'mobile', 'tablet', 'smart tv', '(none)']
              config:
                severity: warn
```

---

## 5. `fct_sessions` (mart, table)

Un registro por sesión (`session_key`).

### `models/marts/fct_sessions.sql`

```sql
with events as (

    select *
    from {{ ref('stg_ga4__events') }}
    where session_key is not null

),

session_grain as (

    select
        session_key,
        user_pseudo_id,
        ga_session_id,
        max(ga_session_number)                                             as session_number,
        min(event_timestamp)                                               as session_started_at,
        max(event_timestamp)                                               as session_ended_at,
        timestamp_diff(max(event_timestamp), min(event_timestamp), second) as session_duration_sec,
        count(*)                                                           as events,
        countif(event_name = 'page_view')                                  as pageviews,
        max(if(session_engaged = '1', 1, 0))                               as is_engaged,
        round(coalesce(sum(engagement_time_msec), 0) / 1000, 1)            as engagement_time_sec,
        count(distinct if(event_name = 'purchase', transaction_id, null))  as transactions,
        round(sum(if(event_name = 'purchase', purchase_revenue_usd, 0)), 2) as revenue_usd
    from events
    group by 1, 2, 3

),

session_start as (

    select
        session_key,
        event_source,
        event_medium,
        event_campaign  as session_campaign,
        user_first_source,
        user_first_medium,
        device_category,
        device_os,
        browser,
        country,
        region
    from events
    where event_name = 'session_start'
    qualify row_number() over (partition by session_key order by event_timestamp) = 1

),

landing as (

    select
        session_key,
        page_location as landing_page,
        page_title    as landing_page_title
    from events
    where event_name = 'page_view'
      and page_location is not null
    qualify row_number() over (partition by session_key order by event_timestamp) = 1

)

select
    g.session_key,
    g.user_pseudo_id,
    g.ga_session_id,
    g.session_number,
    g.session_started_at,
    g.session_ended_at,
    g.session_duration_sec,
    g.events,
    g.pageviews,
    g.is_engaged,
    g.engagement_time_sec,
    g.transactions,
    g.revenue_usd,
    g.transactions > 0                                        as has_purchase,
    l.landing_page,
    l.landing_page_title,
    coalesce(s.event_source, s.user_first_source, '(direct)') as session_source,
    coalesce(s.event_medium, s.user_first_medium, '(none)')   as session_medium,
    s.session_campaign,
    s.device_category,
    s.device_os,
    s.browser,
    s.country,
    s.region
from session_grain g
left join session_start s using (session_key)
left join landing        l using (session_key)
```

---

## 6. `fct_purchases` (mart, table)

Un registro por transacción, deduplicado por `transaction_id`.

### `models/marts/fct_purchases.sql`

```sql
with purchases as (

    select
        transaction_id,
        user_pseudo_id,
        session_key,
        event_timestamp                                       as purchased_at,
        event_date                                            as purchase_date,
        round(purchase_revenue_usd, 2)                        as purchase_revenue_usd,
        total_item_quantity                                   as items_quantity,
        unique_items                                          as distinct_items,
        coalesce(event_source, user_first_source, '(direct)') as source,
        coalesce(event_medium, user_first_medium, '(none)')   as medium,
        device_category,
        country
    from {{ ref('stg_ga4__events') }}
    where event_name = 'purchase'
      and transaction_id is not null
      and transaction_id not in ('(not set)', '')

)

select *
from purchases
qualify row_number() over (partition by transaction_id order by purchased_at) = 1
```

---

## 7. `dim_users` (mart, table)

Un registro por `user_pseudo_id` con métricas de engagement y de ingresos lifetime.

### `models/marts/dim_users.sql`

```sql
with events as (

    select *
    from {{ ref('stg_ga4__events') }}
    where session_key is not null

),

engagement as (

    select
        user_pseudo_id,
        min(event_timestamp)               as first_seen_at,
        max(event_timestamp)               as last_seen_at,
        count(distinct event_date)         as active_days,
        count(distinct session_key)        as sessions,
        count(*)                           as events,
        countif(event_name = 'page_view')  as pageviews
    from events
    group by 1

),

first_touch as (

    select
        user_pseudo_id,
        coalesce(user_first_source, event_source, '(direct)') as first_source,
        coalesce(user_first_medium, event_medium, '(none)')   as first_medium,
        user_first_campaign                                   as first_campaign,
        device_category,
        country
    from events
    qualify row_number() over (partition by user_pseudo_id order by event_timestamp) = 1

),

revenue as (

    select
        user_pseudo_id,
        count(*)                            as orders,
        round(sum(purchase_revenue_usd), 2) as lifetime_revenue_usd,
        min(purchased_at)                   as first_order_at,
        max(purchased_at)                   as last_order_at
    from {{ ref('fct_purchases') }}
    group by 1

)

select
    e.user_pseudo_id,
    e.first_seen_at,
    e.last_seen_at,
    e.active_days,
    e.sessions,
    e.events,
    e.pageviews,
    ft.first_source,
    ft.first_medium,
    ft.first_campaign,
    ft.device_category,
    ft.country,
    coalesce(r.orders, 0)                as orders,
    coalesce(r.lifetime_revenue_usd, 0) as lifetime_revenue_usd,
    r.first_order_at,
    r.last_order_at,
    coalesce(r.orders, 0) > 0            as is_purchaser
from engagement e
left join first_touch ft using (user_pseudo_id)
left join revenue     r  using (user_pseudo_id)
```

---

## 8. Tests

### `models/marts/_marts__models.yml`

```yaml
version: 2

models:
  - name: fct_sessions
    description: Un registro por sesión de GA4 (user_pseudo_id + ga_session_id).
    columns:
      - name: session_key
        data_tests: [unique, not_null]
      - name: user_pseudo_id
        data_tests: [not_null]
      - name: events
        data_tests:
          - dbt_utils.accepted_range: { min_value: 1 }
      - name: pageviews
        data_tests:
          - dbt_utils.accepted_range: { min_value: 0 }
      - name: revenue_usd
        data_tests:
          - dbt_utils.accepted_range: { min_value: 0 }
      - name: is_engaged
        data_tests:
          - accepted_values: { values: [0, 1] }
      - name: session_medium
        data_tests: [not_null]

  - name: fct_purchases
    description: Un registro por transacción completada, deduplicado por transaction_id.
    columns:
      - name: transaction_id
        data_tests: [unique, not_null]
      - name: session_key
        data_tests:
          - not_null
          - relationships:
              to: ref('fct_sessions')
              field: session_key
      - name: user_pseudo_id
        data_tests:
          - not_null
          - relationships:
              to: ref('dim_users')
              field: user_pseudo_id
      - name: purchase_revenue_usd
        data_tests:
          - dbt_utils.accepted_range: { min_value: 0, inclusive: true }

  - name: dim_users
    description: Un registro por user_pseudo_id con engagement e ingresos lifetime.
    columns:
      - name: user_pseudo_id
        data_tests: [unique, not_null]
      - name: sessions
        data_tests:
          - dbt_utils.accepted_range: { min_value: 1 }
      - name: orders
        data_tests:
          - dbt_utils.accepted_range: { min_value: 0 }
      - name: lifetime_revenue_usd
        data_tests:
          - dbt_utils.accepted_range: { min_value: 0 }
      - name: is_purchaser
        data_tests:
          - accepted_values: { values: [true, false] }
```

### Comandos

```powershell
dbt deps                     # instala dbt_utils
dbt debug                    # -> All checks passed!
dbt build                    # corre modelos + tests en orden de dependencias
dbt build --select stg_ga4__events+   # solo staging y aguas abajo
dbt test --select fct_purchases       # solo los tests de un modelo
```

`dbt build` = `run` + `test` respetando el DAG. Es el comando de referencia.

---

## 9. Documentación + lineage

```powershell
dbt docs generate --static           # genera target/static_index.html (autocontenido)
```

Publicar en GitHub Pages:

```powershell
mkdir docs -Force
copy target\static_index.html docs\index.html
git add docs\index.html
git commit -m "docs: publicar catálogo dbt"
git push
```

Luego en GitHub: **Settings → Pages → Source: Deploy from a branch → `main` / `/docs`**.
El lineage graph queda navegable en `https://<usuario>.github.io/dbt-ga4-analytics/`.

---

## 10. Plantilla de README

````markdown
# GA4 → BigQuery analytics models (dbt)

Modelo dimensional sobre el export público de Google Analytics 4
(Google Merchandise Store) en BigQuery, construido con dbt.

## Problema

El export de GA4 a BigQuery llega como una tabla de eventos anidada:
`event_params` y `items` son arrays de structs, la sesión no es una
columna sino un parámetro dentro de un array, y los eventos `purchase`
se duplican cuando el usuario recarga la página de confirmación.
Consultarla ad hoc es repetitivo y propenso a errores.

Este proyecto la convierte en tres tablas limpias y testeadas:

| Modelo | Grano | Uso |
|---|---|---|
| `fct_sessions` | una fila por sesión | comportamiento de sesión, landing pages, engagement, atribución session-scoped |
| `fct_purchases` | una fila por transacción (deduplicada) | ingresos, AOV, análisis de pedidos |
| `dim_users` | una fila por usuario | lifetime value, recurrencia, first-touch |

## Arquitectura

```
source (ga4.events_*)
        │
        ▼
stg_ga4__events        (view — aplana event_params, tipa columnas, crea session_key)
        │
        ├──────────────┬───────────────┐
        ▼              ▼               ▼
  fct_sessions    fct_purchases    dim_users
                       │               ▲
                       └───────────────┘   (dim_users agrega ingresos desde fct_purchases)
```

## Decisiones técnicas

- **Sesionización.** `session_key = user_pseudo_id || '-' || ga_session_id`.
  `ga_session_id` se repite entre usuarios, así que por sí solo no
  identifica una sesión.
- **Atribución.** Session-scoped desde el evento `session_start`;
  user-scoped (first touch) desde `traffic_source`. Se modelan por
  separado en lugar de colapsarlas.
- **Deduplicación de compras.** `row_number()` por `transaction_id`
  ordenando por timestamp, se queda la primera. GA4 reenvía `purchase`
  al recargar la confirmación.
- **Región US.** El dataset destino está en `US` multi-region porque el
  dataset público reside en US y BigQuery no hace join entre regiones.
- **Coste.** El modelo de staging se acota con `_table_suffix` entre dos
  variables de fecha para no escanear fuera del rango del sample.
- **Permisos.** La service account tiene `BigQuery Admin` solo sobre el
  proyecto propio (crea datasets y tablas ahí); la lectura del dataset
  público no requiere permisos adicionales.

## Tests

`unique`, `not_null`, `accepted_values`, `relationships` y
`dbt_utils.accepted_range` sobre claves, rangos numéricos e integridad
referencial entre `fct_purchases`, `fct_sessions` y `dim_users`.

## Cómo ejecutarlo

```bash
uv venv --python 3.12 && source .venv/bin/activate   # Windows: .venv\Scripts\activate
uv pip install "dbt-core~=1.9.0" "dbt-bigquery~=1.9.0"
dbt deps
dbt build
dbt docs generate --static
```

Requiere un `~/.dbt/profiles.yml` con un target BigQuery en región `US`
y una service account con permiso para crear tablas en el proyecto destino.

## Docs

Catálogo y lineage: https://<usuario>.github.io/dbt-ga4-analytics/
````

---

## 11. Checklist de publicación

- [ ] `dbt debug` → `All checks passed!`
- [ ] `dbt build` → todos los modelos OK, todos los tests PASS (0 errores)
- [ ] `dbt docs generate --static` y Pages publicado
- [ ] `.gitignore` cubre `*.json` y `profiles.yml`; la key **no** está en el historial (`git log --all -- '*.json'`)
- [ ] README con problema, arquitectura, decisiones y comando de ejecución
- [ ] Repo público, descripción y topics (`dbt`, `bigquery`, `ga4`, `analytics-engineering`)
- [ ] Enlace en CV y LinkedIn

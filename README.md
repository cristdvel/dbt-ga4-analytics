# dbt-ga4-analytics

[![dbt build](https://github.com/cristdvel/dbt-ga4-analytics/actions/workflows/dbt.yml/badge.svg)](https://github.com/cristdvel/dbt-ga4-analytics/actions/workflows/dbt.yml)

Modelo dimensional sobre el export público de **Google Analytics 4** (Google
Merchandise Store) en **BigQuery**, construido con **dbt**. Convierte la tabla
de eventos anidada de GA4 en tres tablas limpias, tipadas y testeadas.

| Métrica | Valor |
|---|---|
| Rango de datos | 2020-11-01 → 2021-01-31 (~4,3 M eventos) |
| Sesiones modeladas | 360 129 |
| Compras (deduplicadas) | 4 451 |
| Usuarios | 270 154 (3 702 compradores, 1,4 %) |
| AOV | 69,12 USD |

**Docs + lineage:** https://cristdvel.github.io/dbt-ga4-analytics/

---

## El problema

El export de GA4 a BigQuery llega como una tabla de eventos con estructuras
anidadas: `event_params` e `items` son arrays de structs, la sesión no es una
columna sino un parámetro (`ga_session_id`) dentro de un array, y los eventos
`purchase` se duplican cuando el usuario recarga la página de confirmación.
Cada análisis repite el mismo `UNNEST`, la misma deduplicación y la misma
lógica de sesionización.

Este proyecto encapsula esa lógica una vez:

| Modelo | Grano | Para qué sirve |
|---|---|---|
| `stg_ga4__events` | 1 fila por evento | capa base: aplana `event_params`, tipa columnas, crea `session_key` |
| `fct_sessions` | 1 fila por sesión | comportamiento de sesión, landing pages, engagement, atribución session-scoped |
| `fct_purchases` | 1 fila por transacción (deduplicada) | ingresos, AOV, análisis de pedidos |
| `dim_users` | 1 fila por usuario | lifetime value, recurrencia, first-touch |

## Arquitectura

```
source: bigquery-public-data.ga4_obfuscated_sample_ecommerce.events_*
                          │
                          ▼
                 stg_ga4__events   (view)
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
     fct_sessions    fct_purchases     dim_users
                          │               ▲
                          └───────────────┘
                    dim_users agrega ingresos lifetime
                    desde fct_purchases (ya deduplicado)
```

- **staging** → materializado como `view` (lógica de aplanado barata).
- **marts** → materializado como `table` (se consultan repetido, compensa persistir).

## Decisiones técnicas

- **Sesionización.** `session_key = user_pseudo_id || '-' || ga_session_id`.
  `ga_session_id` se reinicia por usuario, así que por sí solo no identifica
  una sesión de forma única.
- **Atribución.** Session-scoped tomada del evento `session_start` (source /
  medium / campaign de `event_params`); user-scoped (first touch) desde
  `traffic_source.*`. Se modelan por separado en lugar de colapsarlas.
- **Deduplicación de compras.** `row_number() over (partition by transaction_id
  order by purchased_at) = 1`. GA4 reenvía `purchase` al recargar la
  confirmación; sin esto los ingresos se inflan.
- **Engagement.** `is_engaged = 1` si algún evento de la sesión trae
  `session_engaged = '1'` (definición nativa de GA4: ≥10 s, ≥2 páginas o
  conversión).
- **Región `US`.** El dataset destino (`dbt_cristhian`) está en `US`
  multi-region porque el dataset público reside en US y BigQuery no hace join
  entre regiones.
- **Coste.** `stg_ga4__events` se acota con `_table_suffix` entre dos variables
  de fecha (`vars` en `dbt_project.yml`) para no escanear fuera del rango del
  sample.
- **Permisos.** La service account tiene `BigQuery Admin` **solo** sobre el
  proyecto propio (crea datasets y tablas ahí). Leer `bigquery-public-data` no
  requiere permisos adicionales.

## Tests (25, todos en verde)

`unique` · `not_null` · `accepted_values` · `relationships` ·
`dbt_utils.accepted_range`

Cubren claves primarias, rangos numéricos (`events ≥ 1`, `revenue ≥ 0`, …) e
integridad referencial entre `fct_purchases` ↔ `fct_sessions` ↔ `dim_users`.

## Cómo ejecutarlo

Requiere Python 3.12 y una service account de BigQuery con permiso para crear
tablas en el proyecto destino.

```bash
# entorno
uv venv --python 3.12
source .venv/bin/activate            # Windows: .venv\Scripts\activate
uv pip install dbt-core dbt-bigquery

# perfil: ~/.dbt/profiles.yml con un target BigQuery en location US
#         (ver profiles.example.yml)

dbt deps
dbt build                            # run + test respetando el DAG
dbt docs generate --static
```

## CI

`.github/workflows/dbt.yml` corre `dbt deps` + `dbt build` (modelos + los 25
tests) en cada push y PR a `main`, contra un dataset aislado (`dbt_ci`). La
key de la service account vive en el secret `BIGQUERY_KEYFILE`; el job la
escribe en `./sa.json` y la borra al final. El build de CI se acota a una
semana de datos vía `--vars` para no escanear el sample completo en cada run.

## Stack

dbt 1.12 · dbt-bigquery · dbt_utils · BigQuery · Python 3.12 (entorno `uv`) ·
GitHub Actions

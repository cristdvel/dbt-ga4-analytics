{{ config(materialized='table') }}

-- Salud diaria del tracking: una fila por día con los indicadores que se
-- vigilan en producción (volumen, duplicados de compra, compras sin valor,
-- PII en URLs, eventos sin sesión). Los umbrales viven en los tests, no aquí:
-- este modelo solo mide.

with events as (

    select
        event_date,
        event_name,
        session_key,
        transaction_id,
        purchase_revenue_usd,
        -- Correo en claro o codificado (%40) dentro de la URL de la página o del referrer,
        -- o parámetros típicos de formulario que arrastran un correo.
        (
            regexp_contains(lower(coalesce(page_location, '')), r'[a-z0-9._%+-]+(@|%40)[a-z0-9.-]+\.[a-z]{2,}')
            or regexp_contains(lower(coalesce(page_referrer, '')), r'[a-z0-9._%+-]+(@|%40)[a-z0-9.-]+\.[a-z]{2,}')
            or regexp_contains(lower(coalesce(page_location, '')), r'[?&](e-?mail|mail|correo)=')
        ) as has_pii_in_url
    from {{ ref('stg_ga4__events') }}

),

daily as (

    select
        event_date,
        count(*)                                                            as events,
        countif(event_name = 'page_view')                                   as page_views,
        count(distinct session_key)                                         as sessions,
        countif(session_key is null)                                        as events_without_session,
        countif(has_pii_in_url)                                             as events_with_pii_in_url,
        countif(event_name = 'purchase')                                    as purchase_events,
        count(distinct if(event_name = 'purchase'
                          and transaction_id not in ('(not set)', ''),
                          transaction_id, null))                            as distinct_transactions,
        countif(event_name = 'purchase'
                and (transaction_id is null or transaction_id in ('(not set)', '')))
                                                                            as purchases_without_transaction_id,
        countif(event_name = 'purchase'
                and transaction_id is not null
                and transaction_id not in ('(not set)', '')
                and coalesce(purchase_revenue_usd, 0) <= 0)                 as purchases_without_value
    from events
    group by event_date

)

select
    *,
    -- Reenvíos de la misma compra: eventos purchase con transaction_id válido menos transacciones distintas.
    purchase_events - purchases_without_transaction_id - distinct_transactions
                                                                            as duplicate_purchase_events,
    -- Media de los 7 días anteriores (sin contar el actual) y razón contra ella.
    avg(events) over (order by event_date rows between 7 preceding and 1 preceding)
                                                                            as events_prev_7d_avg,
    safe_divide(events, avg(events) over (order by event_date rows between 7 preceding and 1 preceding))
                                                                            as volume_ratio
from daily

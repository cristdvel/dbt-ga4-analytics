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

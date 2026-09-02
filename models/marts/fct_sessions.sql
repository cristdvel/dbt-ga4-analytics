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

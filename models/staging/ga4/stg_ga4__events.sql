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
        geo.region                                                                         as region,
        geo.city                                                                           as city

    from source

)

select
    concat(user_pseudo_id, '-', cast(ga_session_id as string)) as session_key,
    *
from flattened

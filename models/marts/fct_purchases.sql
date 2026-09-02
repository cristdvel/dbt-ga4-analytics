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

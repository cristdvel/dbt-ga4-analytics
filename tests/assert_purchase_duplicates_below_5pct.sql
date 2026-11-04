{{ config(severity='warn') }}
-- Más de un 5 % de eventos purchase repetidos suele indicar recarga de la página de confirmación
-- o un tag duplicado. El mart fct_purchases ya deduplica; esto vigila el origen.
select event_date, duplicate_purchase_events, purchase_events
from {{ ref('dq_daily_health') }}
where purchase_events > 0
  and safe_divide(duplicate_purchase_events, purchase_events) > 0.05

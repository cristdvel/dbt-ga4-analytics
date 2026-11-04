{{ config(severity='warn') }}
-- Compras sin transaction_id válido: no se pueden deduplicar ni reconciliar contra el backend,
-- y fct_purchases las excluye. Más de un 5 % de un día suele indicar un dataLayer incompleto.
select event_date, purchases_without_transaction_id, purchase_events
from {{ ref('dq_daily_health') }}
where purchase_events > 0
  and safe_divide(purchases_without_transaction_id, purchase_events) > 0.05

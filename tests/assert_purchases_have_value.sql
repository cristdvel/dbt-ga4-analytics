{{ config(severity='warn') }}
-- Compras con transaction_id válido pero sin valor: el ingreso no se atribuye a ninguna fuente.
select event_date, purchases_without_value, purchase_events
from {{ ref('dq_daily_health') }}
where purchases_without_value > 0

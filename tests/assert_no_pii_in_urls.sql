-- Un correo en la URL se envía a GA4 (y a cualquier destino que lea page_location).
-- Falla el build: no debería haber ningún evento con PII en la URL.
select event_date, events_with_pii_in_url
from {{ ref('dq_daily_health') }}
where events_with_pii_in_url > 0

{{ config(severity='warn') }}
-- Caída de volumen: el día tiene menos de la mitad de eventos que la media de los 7 anteriores.
-- Detecta contenedores sin publicar, CSP que bloquea o tags rotos. Nulo en el primer día de la serie.
select event_date, events, events_prev_7d_avg, volume_ratio
from {{ ref('dq_daily_health') }}
where volume_ratio is not null
  and volume_ratio < 0.5

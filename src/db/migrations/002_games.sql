-- Tabla de partidas (cada usuario tiene una partida)
CREATE TABLE IF NOT EXISTS games (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    state VARCHAR(20) DEFAULT 'waiting_player',
        -- waiting_player: esperando input del jugador
        -- consolidating: acumulando mensajes (timer 30min que se reinicia)
        -- sending_ack: procesando acuse de recibo
        -- waiting_results: esperando enviar resultados (IGNORA mensajes)
        -- sending_results: procesando mensaje de resultados

    -- Estado narrativo del hotel (JSON actualizado por IA cada ciclo)
    hotel_state JSONB DEFAULT '{
        "name": "Hotel Villa Carmen",
        "stars": 2,
        "rooms": 90,
        "occupancy_percent": 35,
        "employees": {
            "total": 12,
            "family": 9,
            "professional": 3
        },
        "monthly_revenue": 45000,
        "monthly_expenses": 48000,
        "google_rating": 2.8,
        "google_reviews_count": 147,
        "technology": {
            "has_wifi": false,
            "has_booking_system": false,
            "has_pms": false,
            "has_card_payment": true,
            "has_website": false
        },
        "chaos_level": 9,
        "family_tension_level": 7,
        "problems_resolved": [],
        "problems_active": [
            "reservas_en_excel",
            "no_wifi_clientes",
            "familia_en_plantilla",
            "resenas_negativas",
            "banquetes_caoticos",
            "cuñado_sin_experiencia"
        ]
    }',

    -- Historial resumido de la partida (una frase por ciclo)
    key_events JSONB DEFAULT '[]',

    -- Control de ciclos
    current_cycle INT DEFAULT 0,
    consolidation_started_at TIMESTAMP,
    consolidation_job_id VARCHAR(100),     -- ID del job en BullMQ para poder cancelarlo
    results_scheduled_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_games_user ON games(user_id);
CREATE INDEX idx_games_state ON games(state);

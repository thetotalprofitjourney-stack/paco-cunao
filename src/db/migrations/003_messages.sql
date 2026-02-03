-- Tabla de mensajes (entrada y salida)
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID REFERENCES games(id) ON DELETE CASCADE,
    cycle INT NOT NULL,
    direction VARCHAR(10) NOT NULL,       -- 'inbound' | 'outbound'
    message_type VARCHAR(20),             -- 'player_input' | 'trigger' | 'ack' | 'results'
    content TEXT NOT NULL,
    wa_message_id VARCHAR(100),
    tokens_input INT,                     -- tokens de input consumidos (si es de IA)
    tokens_output INT,                    -- tokens de output consumidos (si es de IA)
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_messages_game ON messages(game_id);
CREATE INDEX idx_messages_cycle ON messages(game_id, cycle);
CREATE INDEX idx_messages_game_type ON messages(game_id, message_type);

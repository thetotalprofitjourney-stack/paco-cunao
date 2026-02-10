-- Tabla de mensajes (entrada y salida)
CREATE TABLE IF NOT EXISTS messages (
    id CHAR(36) PRIMARY KEY,
    game_id CHAR(36) NOT NULL,
    cycle INT NOT NULL,
    direction VARCHAR(10) NOT NULL COMMENT 'inbound | outbound',
    message_type VARCHAR(20) COMMENT 'player_input | trigger | ack | results',
    content TEXT NOT NULL,
    wa_message_id VARCHAR(100),
    tokens_input INT COMMENT 'tokens de input consumidos (si es de IA)',
    tokens_output INT COMMENT 'tokens de output consumidos (si es de IA)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_messages_game ON messages(game_id);
CREATE INDEX idx_messages_cycle ON messages(game_id, cycle);
CREATE INDEX idx_messages_game_type ON messages(game_id, message_type);

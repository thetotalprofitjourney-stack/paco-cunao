-- Tabla de usuarios registrados
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone VARCHAR(20) UNIQUE NOT NULL,  -- formato E.164: +34612345678
    name VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending_activation',
        -- pending_activation: registrado, esperando primer WhatsApp
        -- active: jugando
        -- inactive: abandonó (>30 días sin escribir)
    created_at TIMESTAMP DEFAULT NOW(),
    last_activity_at TIMESTAMP
);

CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_status ON users(status);

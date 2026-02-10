-- Tabla de usuarios registrados
CREATE TABLE IF NOT EXISTS users (
    id CHAR(36) PRIMARY KEY,
    phone VARCHAR(20) UNIQUE NOT NULL COMMENT 'Formato E.164: +34612345678',
    name VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending_activation' COMMENT 'pending_activation: registrado, esperando primer WhatsApp | active: jugando | inactive: abandonó (>30 días sin escribir)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity_at TIMESTAMP NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_status ON users(status);

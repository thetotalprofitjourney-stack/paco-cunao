-- Para tracking de jobs de BullMQ (opcional, BullMQ tiene su propio almacenamiento en Redis)
CREATE TABLE IF NOT EXISTS scheduled_jobs (
    id CHAR(36) PRIMARY KEY,
    game_id CHAR(36) NOT NULL,
    job_type VARCHAR(20) NOT NULL COMMENT 'send_ack | send_results',
    scheduled_for TIMESTAMP NOT NULL,
    bullmq_job_id VARCHAR(100),
    status VARCHAR(20) DEFAULT 'pending' COMMENT 'pending | completed | failed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_jobs_scheduled ON scheduled_jobs(scheduled_for);
CREATE INDEX idx_jobs_game ON scheduled_jobs(game_id);

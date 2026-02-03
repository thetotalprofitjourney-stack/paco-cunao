-- Para tracking de jobs de BullMQ (opcional, BullMQ tiene su propio almacenamiento en Redis)
CREATE TABLE IF NOT EXISTS scheduled_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID REFERENCES games(id) ON DELETE CASCADE,
    job_type VARCHAR(20) NOT NULL,  -- 'send_ack' | 'send_results'
    scheduled_for TIMESTAMP NOT NULL,
    bullmq_job_id VARCHAR(100),
    status VARCHAR(20) DEFAULT 'pending',  -- 'pending' | 'completed' | 'failed'
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_jobs_scheduled ON scheduled_jobs(scheduled_for);
CREATE INDEX idx_jobs_game ON scheduled_jobs(game_id);

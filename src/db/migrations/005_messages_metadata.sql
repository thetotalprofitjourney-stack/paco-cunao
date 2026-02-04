-- Añadir campo metadata a la tabla messages
ALTER TABLE messages ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Añadir el nuevo tipo de mensaje 'reactivation'
-- (Ya está en la lógica, pero documentamos que es válido)
COMMENT ON COLUMN messages.message_type IS 'player_input | trigger | ack | reactivation | results';

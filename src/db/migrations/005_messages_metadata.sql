-- Añadir campo metadata a la tabla messages
ALTER TABLE messages ADD COLUMN IF NOT EXISTS metadata JSON;

-- Actualizar el comentario del campo message_type para incluir 'reactivation'
ALTER TABLE messages MODIFY COLUMN message_type VARCHAR(20) COMMENT 'player_input | trigger | ack | reactivation | results';

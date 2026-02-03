// Estados de usuario
const USER_STATUS = {
  PENDING_ACTIVATION: 'pending_activation',
  ACTIVE: 'active',
  INACTIVE: 'inactive',
};

// Estados del juego
const GAME_STATE = {
  WAITING_PLAYER: 'waiting_player',
  CONSOLIDATING: 'consolidating',
  SENDING_ACK: 'sending_ack',
  WAITING_RESULTS: 'waiting_results',
  SENDING_RESULTS: 'sending_results',
};

// Tipos de mensaje
const MESSAGE_TYPE = {
  PLAYER_INPUT: 'player_input',
  TRIGGER: 'trigger',
  ACK: 'ack',
  RESULTS: 'results',
};

// Dirección de mensaje
const MESSAGE_DIRECTION = {
  INBOUND: 'inbound',
  OUTBOUND: 'outbound',
};

// Tipos de job
const JOB_TYPE = {
  SEND_ACK: 'send_ack',
  SEND_RESULTS: 'send_results',
};

// Estado del hotel inicial
const INITIAL_HOTEL_STATE = {
  name: 'Hotel Villa Carmen',
  stars: 2,
  rooms: 90,
  occupancy_percent: 35,
  employees: {
    total: 12,
    family: 9,
    professional: 3,
  },
  monthly_revenue: 45000,
  monthly_expenses: 48000,
  google_rating: 2.8,
  google_reviews_count: 147,
  technology: {
    has_wifi: false,
    has_booking_system: false,
    has_pms: false,
    has_card_payment: true,
    has_website: false,
  },
  chaos_level: 9,
  family_tension_level: 7,
  problems_resolved: [],
  problems_active: [
    'reservas_en_excel',
    'no_wifi_clientes',
    'familia_en_plantilla',
    'resenas_negativas',
    'banquetes_caoticos',
    'cuñado_sin_experiencia',
  ],
};

module.exports = {
  USER_STATUS,
  GAME_STATE,
  MESSAGE_TYPE,
  MESSAGE_DIRECTION,
  JOB_TYPE,
  INITIAL_HOTEL_STATE,
};

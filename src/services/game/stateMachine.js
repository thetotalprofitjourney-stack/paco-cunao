const { GAME_STATE } = require('../../config/constants');

const canTransition = (currentState, newState) => {
  const validTransitions = {
    [GAME_STATE.WAITING_PLAYER]: [GAME_STATE.CONSOLIDATING],
    [GAME_STATE.CONSOLIDATING]: [GAME_STATE.SENDING_ACK, GAME_STATE.WAITING_PLAYER],
    [GAME_STATE.SENDING_ACK]: [GAME_STATE.WAITING_RESULTS],
    [GAME_STATE.WAITING_RESULTS]: [GAME_STATE.SENDING_REACTIVATION],
    [GAME_STATE.SENDING_REACTIVATION]: [GAME_STATE.WAITING_REACTIVATION],
    [GAME_STATE.WAITING_REACTIVATION]: [GAME_STATE.SENDING_RESULTS],
    [GAME_STATE.SENDING_RESULTS]: [GAME_STATE.WAITING_PLAYER],
  };

  return validTransitions[currentState]?.includes(newState) || false;
};

const shouldIgnoreMessage = (gameState) => {
  // Durante WAITING_RESULTS, ignoramos todos los mensajes del jugador
  // (Paco está "desconectado" trabajando)
  return gameState === GAME_STATE.WAITING_RESULTS;
};

const shouldProcessMessage = (gameState) => {
  // Procesamos mensajes en WAITING_PLAYER, CONSOLIDATING y WAITING_REACTIVATION
  return (
    gameState === GAME_STATE.WAITING_PLAYER ||
    gameState === GAME_STATE.CONSOLIDATING ||
    gameState === GAME_STATE.WAITING_REACTIVATION
  );
};

const isWaitingForReactivation = (gameState) => {
  // El jugador debe responder a la plantilla de reactivación
  return gameState === GAME_STATE.WAITING_REACTIVATION;
};

module.exports = {
  canTransition,
  shouldIgnoreMessage,
  shouldProcessMessage,
  isWaitingForReactivation,
};

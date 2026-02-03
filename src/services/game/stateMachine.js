const { GAME_STATE } = require('../../config/constants');

const canTransition = (currentState, newState) => {
  const validTransitions = {
    [GAME_STATE.WAITING_PLAYER]: [GAME_STATE.CONSOLIDATING],
    [GAME_STATE.CONSOLIDATING]: [GAME_STATE.SENDING_ACK, GAME_STATE.WAITING_PLAYER],
    [GAME_STATE.SENDING_ACK]: [GAME_STATE.WAITING_RESULTS],
    [GAME_STATE.WAITING_RESULTS]: [GAME_STATE.SENDING_RESULTS],
    [GAME_STATE.SENDING_RESULTS]: [GAME_STATE.WAITING_PLAYER],
  };

  return validTransitions[currentState]?.includes(newState) || false;
};

const shouldIgnoreMessage = (gameState) => {
  // Durante WAITING_RESULTS, ignoramos todos los mensajes del jugador
  return gameState === GAME_STATE.WAITING_RESULTS;
};

const shouldProcessMessage = (gameState) => {
  // Solo procesamos mensajes en WAITING_PLAYER y CONSOLIDATING
  return (
    gameState === GAME_STATE.WAITING_PLAYER || gameState === GAME_STATE.CONSOLIDATING
  );
};

module.exports = {
  canTransition,
  shouldIgnoreMessage,
  shouldProcessMessage,
};

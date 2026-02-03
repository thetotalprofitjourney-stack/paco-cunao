const env = require('../../config/env');

const isNightTime = () => {
  // Hora actual en España
  const spainTime = new Date().toLocaleString('en-US', { timeZone: env.timezone });
  const hour = new Date(spainTime).getHours();
  return hour >= env.nightStartHour || hour < env.nightEndHour;
};

const getNextAllowedTime = () => {
  // Devuelve las 07:00 del día siguiente (o de hoy si aún no son las 07:00)
  const now = new Date();
  const spain = new Date(now.toLocaleString('en-US', { timeZone: env.timezone }));

  let next7am = new Date(spain);
  next7am.setHours(env.nightEndHour, 0, 0, 0);

  // Si ya pasaron las 07:00 de hoy, programar para mañana
  if (spain.getHours() >= env.nightEndHour) {
    next7am.setDate(next7am.setDate(next7am.getDate() + 1));
  }

  return next7am;
};

const getDelayUntilNextAllowedTime = () => {
  if (!isNightTime()) {
    return 0; // Enviar ahora
  }

  const next7am = getNextAllowedTime();
  const now = new Date();
  return next7am.getTime() - now.getTime();
};

module.exports = {
  isNightTime,
  getNextAllowedTime,
  getDelayUntilNextAllowedTime,
};

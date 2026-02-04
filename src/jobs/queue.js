const { Queue, Worker } = require('bullmq');
const env = require('../config/env');

const connection = {
  host: env.redisUrl.includes('://') ? new URL(env.redisUrl).hostname : 'localhost',
  port: env.redisUrl.includes('://') ? new URL(env.redisUrl).port || 6379 : 6379,
};

// Crear la cola
const gameQueue = new Queue('game-jobs', { connection });

// Funciones helper para añadir jobs
const addConsolidationJob = async (gameId, cycle) => {
  const job = await gameQueue.add(
    'send_ack',
    { gameId, cycle },
    {
      delay: env.consolidationWindowMs,
      jobId: `ack-${gameId}-${cycle}-${Date.now()}`,
    }
  );

  return job.id;
};

const addReactivationJob = async (gameId, cycle, delayMs, daysElapsed) => {
  const job = await gameQueue.add(
    'send_reactivation',
    { gameId, cycle, daysElapsed },
    {
      delay: delayMs,
      jobId: `reactivation-${gameId}-${cycle}-${Date.now()}`,
    }
  );

  return job.id;
};

const addResultsJob = async (gameId, cycle, daysElapsed) => {
  // Este job se ejecuta inmediatamente después de que el jugador responda a la plantilla
  const job = await gameQueue.add(
    'send_results',
    { gameId, cycle, daysElapsed },
    {
      jobId: `results-${gameId}-${cycle}-${Date.now()}`,
    }
  );

  return job.id;
};

const cancelJob = async (jobId) => {
  try {
    const job = await gameQueue.getJob(jobId);
    if (job) {
      await job.remove();
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error canceling job:', error);
    return false;
  }
};

module.exports = {
  gameQueue,
  addConsolidationJob,
  addReactivationJob,
  addResultsJob,
  cancelJob,
};

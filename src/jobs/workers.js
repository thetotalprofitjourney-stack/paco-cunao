const { Worker } = require('bullmq');
const env = require('../config/env');
const { processSendAck } = require('./sendAck');
const { processSendResults } = require('./sendResults');

const connection = {
  host: env.redisUrl.includes('://') ? new URL(env.redisUrl).hostname : 'localhost',
  port: env.redisUrl.includes('://') ? new URL(env.redisUrl).port || 6379 : 6379,
};

// Worker para procesar jobs
const gameWorker = new Worker(
  'game-jobs',
  async (job) => {
    console.log(`Processing job ${job.id} of type ${job.name}`);

    if (job.name === 'send_ack') {
      await processSendAck(job);
    } else if (job.name === 'send_results') {
      await processSendResults(job);
    } else {
      console.error(`Unknown job type: ${job.name}`);
    }
  },
  {
    connection,
    concurrency: 5,
  }
);

gameWorker.on('completed', (job) => {
  console.log(`Job ${job.id} completed successfully`);
});

gameWorker.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed:`, err);
});

module.exports = {
  gameWorker,
};

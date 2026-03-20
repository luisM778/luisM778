require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { Worker } = require('bullmq');
const { connection } = require('./queue');
const axios = require('axios');
const { logger } = require('../core/logger');

const worker = new Worker(
  'argus-tasks',
  async (job) => {
    if (job.name !== 'api') return;

    logger.info(`[APIWorker] Processing job ${job.id}: ${job.data.method} ${job.data.url}`);

    const { method = 'GET', url, headers = {}, body } = job.data;

    const response = await axios({
      method,
      url,
      headers,
      data: body,
      timeout: 30000,
    });

    return {
      status: response.status,
      data: response.data,
      headers: response.headers,
    };
  },
  {
    connection,
    concurrency: 5,
  }
);

worker.on('completed', (job) => logger.info(`[APIWorker] Completed: ${job.id}`));
worker.on('failed', (job, err) => logger.error(`[APIWorker] Failed: ${job.id} - ${err.message}`));

logger.info('APIWorker started');
module.exports = { worker };

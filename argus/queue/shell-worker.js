require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { Worker } = require('bullmq');
const { connection } = require('./queue');
const { ShellTool } = require('../tools/shell');
const { logger } = require('../core/logger');

const shell = new ShellTool();

const worker = new Worker(
  'argus-tasks',
  async (job) => {
    if (job.name !== 'shell') return;

    logger.info(`[ShellWorker] Processing job ${job.id}: ${job.data.command}`);
    return shell.execute(job.data.command, job.data.options);
  },
  {
    connection,
    concurrency: 3,
  }
);

worker.on('completed', (job) => logger.info(`[ShellWorker] Completed: ${job.id}`));
worker.on('failed', (job, err) => logger.error(`[ShellWorker] Failed: ${job.id} - ${err.message}`));

logger.info('ShellWorker started');
module.exports = { worker };

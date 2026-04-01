require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { Worker } = require('bullmq');
const { connection } = require('./queue');
const { BrowserTool } = require('../tools/browser');
const { logger } = require('../core/logger');

const browser = new BrowserTool();

const worker = new Worker(
  'nexus-tasks',
  async (job) => {
    if (job.name !== 'browser') return;

    logger.info(`[BrowserWorker] Processing job ${job.id}: ${job.data.action}`);

    const { action, url, selector } = job.data;

    switch (action) {
      case 'scrape':
        return browser.scrape(url, selector);
      case 'screenshot':
        return browser.screenshot(url);
      case 'extract':
        return browser.extractData(url, job.data.schema);
      default:
        throw new Error(`Unknown browser action: ${action}`);
    }
  },
  {
    connection,
    concurrency: 2,
  }
);

worker.on('completed', (job) => logger.info(`[BrowserWorker] Completed: ${job.id}`));
worker.on('failed', (job, err) => logger.error(`[BrowserWorker] Failed: ${job.id} - ${err.message}`));

logger.info('BrowserWorker started');
module.exports = { worker };

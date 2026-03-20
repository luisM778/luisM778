const { Queue, Worker, QueueEvents } = require('bullmq');
const Redis = require('ioredis');
const { logger } = require('../core/logger');

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
};

class TaskQueue {
  constructor() {
    this.queue = null;
    this.events = null;
  }

  async initialize() {
    this.queue = new Queue('argus-tasks', { connection });
    this.events = new QueueEvents('argus-tasks', { connection });

    this.events.on('completed', ({ jobId }) => {
      logger.info(`Task completed: ${jobId}`);
    });

    this.events.on('failed', ({ jobId, failedReason }) => {
      logger.error(`Task failed: ${jobId} - ${failedReason}`);
    });

    logger.info('TaskQueue initialized');
  }

  async add(task) {
    const job = await this.queue.add(task.type || 'default', task, {
      priority: task.priority || 3,
      attempts: task.retries || 3,
      backoff: { type: 'exponential', delay: 2000 },
    });
    logger.info(`Task queued: ${job.id} (${task.type || 'default'})`);
    return { jobId: job.id, status: 'queued' };
  }

  async getPending() {
    if (!this.queue) return [];
    const waiting = await this.queue.getWaiting();
    const active = await this.queue.getActive();
    return [...waiting, ...active].map((j) => ({
      id: j.id,
      type: j.name,
      data: j.data,
      status: j.isActive ? 'active' : 'waiting',
    }));
  }

  async getCompleted(limit = 10) {
    if (!this.queue) return [];
    const completed = await this.queue.getCompleted(0, limit - 1);
    return completed.map((j) => ({ id: j.id, type: j.name, result: j.returnvalue }));
  }

  static createWorker(name, processor) {
    return new Worker('argus-tasks', processor, {
      connection,
      concurrency: parseInt(process.env.MAX_CONCURRENT_TASKS || '5'),
    });
  }
}

module.exports = { TaskQueue, connection };

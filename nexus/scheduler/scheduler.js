const cron = require('node-cron');
const { logger } = require('../core/logger');

class Scheduler {
  constructor(orchestrator) {
    this.orchestrator = orchestrator;
    this.jobs = [];
  }

  start() {
    logger.info('Starting scheduler...');

    // Every 30 minutes – market monitoring
    this.schedule(
      process.env.MARKET_MONITOR_CRON || '*/30 * * * *',
      'market-monitor',
      async () => {
        logger.info('[Scheduler] Running market monitor');
        await this.orchestrator.agents.crypto?.execute({
          action: 'market_monitor',
          params: { type: 'monitor' },
        });
      }
    );

    // Every 4 hours – trend analysis
    this.schedule(
      process.env.TREND_ANALYSIS_CRON || '0 */4 * * *',
      'trend-analysis',
      async () => {
        logger.info('[Scheduler] Running trend analysis');
        await this.orchestrator.agents.research?.execute({
          action: 'trend_analysis',
          params: { type: 'opportunity_scan', domain: 'technology' },
        });
      }
    );

    // Daily at 8 AM – daily briefing and reports
    this.schedule(
      process.env.DAILY_REPORT_CRON || '0 8 * * *',
      'daily-report',
      async () => {
        logger.info('[Scheduler] Running daily report');
        await this.orchestrator.agents.strategy?.execute({
          action: 'daily_briefing',
          params: { type: 'daily_briefing' },
        });
      }
    );

    // Full autonomy loop – every 2 hours
    this.schedule('0 */2 * * *', 'autonomy-loop', async () => {
      logger.info('[Scheduler] Running full autonomy loop');
      await this.orchestrator.autonomyLoop();
    });

    logger.info(`Scheduler started with ${this.jobs.length} jobs`);
  }

  schedule(cronExpr, name, handler) {
    if (!cron.validate(cronExpr)) {
      logger.error(`Invalid cron expression for ${name}: ${cronExpr}`);
      return;
    }

    const job = cron.schedule(cronExpr, async () => {
      try {
        await handler();
      } catch (err) {
        logger.error(`[Scheduler] Job "${name}" failed: ${err.message}`);
      }
    });

    this.jobs.push({ name, cronExpr, job });
    logger.info(`Scheduled: "${name}" → ${cronExpr}`);
  }

  stop() {
    this.jobs.forEach(({ name, job }) => {
      job.stop();
      logger.info(`Stopped job: ${name}`);
    });
  }
}

module.exports = { Scheduler };

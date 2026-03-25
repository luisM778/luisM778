require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { logger } = require('./core/logger');
const { Orchestrator } = require('./core/orchestrator');
const { Scheduler } = require('./scheduler/scheduler');
const apiRoutes = require('./api/routes');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', apiRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'argus', timestamp: new Date().toISOString() });
});

async function boot() {
  logger.info('=== ARGUS Starting ===');

  // Initialize orchestrator (connects DB, Redis, agents)
  const orchestrator = new Orchestrator();
  await orchestrator.initialize();

  // Make orchestrator available to routes
  app.locals.orchestrator = orchestrator;

  // Start scheduler
  const scheduler = new Scheduler(orchestrator);
  scheduler.start();

  app.listen(PORT, () => {
    logger.info(`ARGUS API listening on port ${PORT}`);
    logger.info('System ready. Autonomous loop active.');
  });
}

boot().catch((err) => {
  logger.error('Failed to start ARGUS', err);
  process.exit(1);
});

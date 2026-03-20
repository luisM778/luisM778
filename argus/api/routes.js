const express = require('express');
const { logger } = require('../core/logger');

const router = express.Router();

// GET /api/agents – list all registered agents
router.get('/agents', (req, res) => {
  const orchestrator = req.app.locals.orchestrator;
  const agents = orchestrator.getAgentList();
  res.json({ agents });
});

// GET /api/tasks – list recent tasks
router.get('/tasks', async (req, res) => {
  try {
    const orchestrator = req.app.locals.orchestrator;
    const limit = parseInt(req.query.limit) || 20;
    const tasks = await orchestrator.memory.getRecentTasks(limit);
    const pending = await orchestrator.queue.getPending();
    res.json({ tasks, pending });
  } catch (err) {
    logger.error('GET /tasks error', { error: err.message });
    res.status(500).json({ error: err.message });
  }
});

// GET /api/opportunities – list business opportunities
router.get('/opportunities', async (req, res) => {
  try {
    const orchestrator = req.app.locals.orchestrator;
    const status = req.query.status || null;
    const opportunities = await orchestrator.memory.getOpportunities(status);
    res.json({ opportunities });
  } catch (err) {
    logger.error('GET /opportunities error', { error: err.message });
    res.status(500).json({ error: err.message });
  }
});

// POST /api/task – submit a new task
router.post('/task', async (req, res) => {
  try {
    const orchestrator = req.app.locals.orchestrator;
    const task = req.body;

    if (!task.type && !task.action) {
      return res.status(400).json({ error: 'Task must include "type" or "action"' });
    }

    const result = await orchestrator.submitTask(task);
    res.status(201).json(result);
  } catch (err) {
    logger.error('POST /task error', { error: err.message });
    if (err.message.includes('blocked')) {
      return res.status(403).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
});

// POST /api/agents/:name/execute – execute an agent directly
router.post('/agents/:name/execute', async (req, res) => {
  try {
    const orchestrator = req.app.locals.orchestrator;
    const agent = orchestrator.agents[req.params.name];

    if (!agent) {
      return res.status(404).json({ error: `Agent "${req.params.name}" not found` });
    }

    const result = await agent.execute(req.body);
    res.json({ agent: req.params.name, result });
  } catch (err) {
    logger.error(`Agent execute error`, { error: err.message });
    res.status(500).json({ error: err.message });
  }
});

// POST /api/autonomy – trigger the autonomy loop manually
router.post('/autonomy', async (req, res) => {
  try {
    const orchestrator = req.app.locals.orchestrator;
    const result = await orchestrator.autonomyLoop(req.body);
    res.json(result);
  } catch (err) {
    logger.error('Autonomy loop error', { error: err.message });
    res.status(500).json({ error: err.message });
  }
});

// GET /api/insights – get recent insights
router.get('/insights', async (req, res) => {
  try {
    const orchestrator = req.app.locals.orchestrator;
    const limit = parseInt(req.query.limit) || 20;
    const insights = await orchestrator.memory.getRecentInsights(limit);
    res.json({ insights });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/search – semantic search across memory
router.get('/search', async (req, res) => {
  try {
    const orchestrator = req.app.locals.orchestrator;
    const { q, limit = 5 } = req.query;
    if (!q) return res.status(400).json({ error: 'Query parameter "q" required' });
    const results = await orchestrator.memory.semanticSearch(q, parseInt(limit));
    res.json({ query: q, results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

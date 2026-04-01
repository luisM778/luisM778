const { logger } = require('./logger');
const { Planner } = require('./planner');
const { PolicyGuard } = require('./policy-guard');
const { MemoryManager } = require('../memory/memory-manager');
const { TaskQueue } = require('../queue/queue');
const { ResearchAgent } = require('../agents/research-agent');
const { SupplierAgent } = require('../agents/supplier-agent');
const { SalesAgent } = require('../agents/sales-agent');
const { FinanceAgent } = require('../agents/finance-agent');
const { CryptoAgent } = require('../agents/crypto-agent');
const { StrategyAgent } = require('../agents/strategy-agent');
const { LLMClient } = require('./llm-client');

class Orchestrator {
  constructor() {
    this.agents = {};
    this.planner = new Planner();
    this.guard = new PolicyGuard();
    this.memory = new MemoryManager();
    this.queue = new TaskQueue();
    this.llm = new LLMClient();
  }

  async initialize() {
    logger.info('Initializing Orchestrator...');

    // Connect memory (Postgres + Redis + ChromaDB)
    await this.memory.connect();

    // Initialize task queue
    await this.queue.initialize();

    // Register agents
    this.agents = {
      research: new ResearchAgent(this.llm, this.memory),
      supplier: new SupplierAgent(this.llm, this.memory),
      sales: new SalesAgent(this.llm, this.memory),
      finance: new FinanceAgent(this.llm, this.memory),
      crypto: new CryptoAgent(this.llm, this.memory),
      strategy: new StrategyAgent(this.llm, this.memory),
    };

    logger.info(`Registered ${Object.keys(this.agents).length} agents`);
    return this;
  }

  /**
   * Autonomy loop: observe → think → plan → act → evaluate → learn
   */
  async autonomyLoop(context = {}) {
    logger.info('Starting autonomy cycle');

    try {
      // 1. OBSERVE – gather current state
      const observations = await this.observe(context);

      // 2. THINK – analyze observations with LLM
      const analysis = await this.think(observations);

      // 3. PLAN – create action plan
      const plan = await this.planner.createPlan(analysis, this.agents);

      // 4. ACT – execute plan through agents
      const results = await this.act(plan);

      // 5. EVALUATE – assess results
      const evaluation = await this.evaluate(results, plan);

      // 6. LEARN – store insights
      await this.learn(evaluation);

      logger.info('Autonomy cycle complete', { tasksExecuted: results.length });
      return { observations, analysis, plan, results, evaluation };
    } catch (err) {
      logger.error('Autonomy loop error', { error: err.message });
      throw err;
    }
  }

  async observe(context) {
    const recentTasks = await this.memory.getRecentTasks(10);
    const pendingTasks = await this.queue.getPending();
    return { recentTasks, pendingTasks, context, timestamp: new Date().toISOString() };
  }

  async think(observations) {
    const prompt = `You are NEXUS, an autonomous business intelligence assistant.
Analyze the following observations and identify priorities, risks, and opportunities.
Respond in JSON with keys: priorities (array), risks (array), opportunities (array), recommended_actions (array).

Observations:
${JSON.stringify(observations, null, 2)}`;

    const response = await this.llm.generate(prompt);
    try {
      return JSON.parse(response);
    } catch {
      return { priorities: [], risks: [], opportunities: [], recommended_actions: [], raw: response };
    }
  }

  async act(plan) {
    const results = [];
    for (const step of plan.steps || []) {
      // Security check
      if (!this.guard.isAllowed(step)) {
        logger.warn('Policy guard blocked step', { step: step.action });
        results.push({ step: step.action, status: 'blocked', reason: 'policy violation' });
        continue;
      }

      const agent = this.agents[step.agent];
      if (!agent) {
        results.push({ step: step.action, status: 'error', reason: `Unknown agent: ${step.agent}` });
        continue;
      }

      try {
        const result = await agent.execute(step);
        results.push({ step: step.action, status: 'completed', result });
      } catch (err) {
        results.push({ step: step.action, status: 'error', reason: err.message });
      }
    }
    return results;
  }

  async evaluate(results, plan) {
    const succeeded = results.filter((r) => r.status === 'completed').length;
    const failed = results.filter((r) => r.status === 'error').length;
    const blocked = results.filter((r) => r.status === 'blocked').length;
    return { total: results.length, succeeded, failed, blocked, details: results };
  }

  async learn(evaluation) {
    await this.memory.storeInsight({
      type: 'autonomy_cycle',
      evaluation,
      timestamp: new Date().toISOString(),
    });
  }

  /** Direct task submission */
  async submitTask(task) {
    if (!this.guard.isAllowed(task)) {
      throw new Error('Task blocked by policy guard');
    }
    return this.queue.add(task);
  }

  getAgentList() {
    return Object.entries(this.agents).map(([name, agent]) => ({
      name,
      description: agent.description,
      capabilities: agent.capabilities,
    }));
  }
}

module.exports = { Orchestrator };

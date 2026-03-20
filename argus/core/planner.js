const { logger } = require('./logger');
const { LLMClient } = require('./llm-client');

class Planner {
  constructor() {
    this.llm = new LLMClient();
  }

  async createPlan(analysis, agents) {
    const agentNames = Object.keys(agents);

    const prompt = `You are ARGUS Planner. Create an execution plan based on this analysis.
Available agents: ${agentNames.join(', ')}

Analysis:
${JSON.stringify(analysis, null, 2)}

Respond in JSON with key "steps" as an array. Each step: { "agent": "<agent_name>", "action": "<description>", "params": {} , "priority": 1-5 }
Only use agents from the available list. Sort by priority (1=highest).`;

    try {
      const response = await this.llm.generate(prompt);
      const plan = JSON.parse(response);
      logger.info(`Plan created with ${plan.steps?.length || 0} steps`);
      return plan;
    } catch {
      logger.warn('Planner could not parse LLM response, returning empty plan');
      return { steps: [] };
    }
  }
}

module.exports = { Planner };

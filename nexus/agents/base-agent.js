const { logger } = require('../core/logger');

/**
 * BaseAgent – abstract class for all NEXUS agents.
 * Every agent follows the pattern: analyze → decide → execute → report
 */
class BaseAgent {
  constructor(name, llm, memory) {
    this.name = name;
    this.llm = llm;
    this.memory = memory;
    this.description = '';
    this.capabilities = [];
  }

  async execute(task) {
    logger.info(`[${this.name}] Executing: ${task.action}`);
    const start = Date.now();

    try {
      const result = await this.run(task);
      const duration = Date.now() - start;

      // Store execution in memory
      await this.memory.storeTaskResult({
        agent: this.name,
        task: task.action,
        result,
        duration,
        timestamp: new Date().toISOString(),
      });

      logger.info(`[${this.name}] Completed in ${duration}ms`);
      return result;
    } catch (err) {
      logger.error(`[${this.name}] Failed: ${err.message}`);
      throw err;
    }
  }

  /** Subclasses must implement this */
  async run(task) {
    throw new Error(`${this.name}.run() not implemented`);
  }

  /** Ask the LLM for analysis */
  async analyze(prompt) {
    return this.llm.generate(`[${this.name}] ${prompt}`);
  }
}

module.exports = { BaseAgent };

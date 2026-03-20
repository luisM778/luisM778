const { logger } = require('./logger');

/**
 * PolicyGuard – blocks dangerous operations and enforces security rules.
 */
class PolicyGuard {
  constructor() {
    // Commands that must never be executed
    this.blockedCommands = ['rm', 'sudo', 'shutdown', 'reboot', 'mkfs', 'dd', 'chmod 777', 'curl | bash', 'wget | bash'];
    this.blockedPatterns = [
      /rm\s+(-rf?|--recursive)/i,
      /sudo\s+/i,
      /shutdown/i,
      /reboot/i,
      /mkfs/i,
      /dd\s+if=/i,
      />\s*\/dev\//i,
      /chmod\s+777/i,
      /\|\s*(bash|sh|zsh)/i,
    ];

    // Max budget per task (in abstract units)
    this.maxTaskBudget = 100;
  }

  isAllowed(task) {
    if (!task) return false;

    // Check shell commands
    if (task.command || task.action) {
      const cmd = task.command || task.action;
      for (const pattern of this.blockedPatterns) {
        if (pattern.test(cmd)) {
          logger.warn(`PolicyGuard BLOCKED: "${cmd}" matches pattern ${pattern}`);
          return false;
        }
      }
    }

    // Check explicit blocked commands
    if (task.command) {
      const baseCmd = task.command.trim().split(/\s+/)[0];
      if (this.blockedCommands.includes(baseCmd)) {
        logger.warn(`PolicyGuard BLOCKED command: ${baseCmd}`);
        return false;
      }
    }

    return true;
  }

  /**
   * Sanitize user input for shell execution
   */
  sanitize(input) {
    if (typeof input !== 'string') return '';
    // Remove shell metacharacters
    return input.replace(/[;&|`$(){}]/g, '');
  }
}

module.exports = { PolicyGuard };

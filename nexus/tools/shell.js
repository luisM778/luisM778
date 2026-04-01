const { execSync } = require('child_process');
const { PolicyGuard } = require('../core/policy-guard');
const { logger } = require('../core/logger');

class ShellTool {
  constructor() {
    this.guard = new PolicyGuard();
    this.sandbox = process.env.SHELL_SANDBOX === 'true';
  }

  execute(command, options = {}) {
    // Security check
    if (!this.guard.isAllowed({ command })) {
      throw new Error(`Blocked command: "${command}"`);
    }

    const sanitizedCmd = this.guard.sanitize(command);
    const timeout = options.timeout || 30000;

    logger.info(`Shell executing: ${sanitizedCmd}`);

    let fullCmd = sanitizedCmd;

    // If sandbox mode, run inside Docker container
    if (this.sandbox) {
      fullCmd = `docker run --rm --network none -m 256m --cpus 0.5 alpine:latest sh -c "${sanitizedCmd.replace(/"/g, '\\"')}"`;
    }

    try {
      const output = execSync(fullCmd, {
        timeout,
        encoding: 'utf-8',
        maxBuffer: 5 * 1024 * 1024,
      });
      return { command: sanitizedCmd, output: output.trim(), exitCode: 0 };
    } catch (err) {
      return { command: sanitizedCmd, output: err.stderr || err.message, exitCode: err.status || 1 };
    }
  }
}

module.exports = { ShellTool };

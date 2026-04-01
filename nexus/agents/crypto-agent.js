const { BaseAgent } = require('./base-agent');

class CryptoAgent extends BaseAgent {
  constructor(llm, memory) {
    super('CryptoAgent', llm, memory);
    this.description = 'Monitors cryptocurrency markets, trends, and blockchain opportunities';
    this.capabilities = ['market_monitor', 'token_analysis', 'defi_scan', 'sentiment_analysis'];
  }

  async run(task) {
    const { params = {} } = task;

    switch (params.type || 'monitor') {
      case 'monitor':
        return this.marketMonitor(params);
      case 'token_analysis':
        return this.tokenAnalysis(params);
      case 'defi':
        return this.defiScan(params);
      case 'sentiment':
        return this.sentimentAnalysis(params);
      default:
        return this.marketMonitor(params);
    }
  }

  async marketMonitor(params) {
    const prompt = `Provide a crypto market overview.
Focus on: ${params.tokens || 'BTC, ETH, SOL'}
Include: current trends, market sentiment, key levels, notable events.
Respond in JSON with keys: market_sentiment, tokens (array of { symbol, trend, support, resistance, signal }), alerts, summary.`;
    const result = await this.analyze(prompt);
    return { type: 'crypto_monitor', data: result };
  }

  async tokenAnalysis(params) {
    const prompt = `Deep analysis of token: ${params.token || 'BTC'}
Cover: fundamentals, technical analysis, on-chain metrics, catalysts.
Respond in JSON with keys: token, fundamental_score, technical_outlook, on_chain_summary, catalysts, risk_factors, verdict.`;
    const result = await this.analyze(prompt);
    return { type: 'token_analysis', data: result };
  }

  async defiScan(params) {
    const prompt = `Scan DeFi opportunities on: ${params.chain || 'Ethereum'}
Identify: high-yield pools, new protocols, farming opportunities.
Respond in JSON with keys: opportunities (array of { protocol, type, apy, tvl, risk_level, chain }), warnings.`;
    const result = await this.analyze(prompt);
    return { type: 'defi_scan', data: result };
  }

  async sentimentAnalysis(params) {
    const prompt = `Analyze crypto market sentiment for: ${params.token || 'overall market'}
Sources: social media trends, news, on-chain data.
Respond in JSON with keys: overall_sentiment (bullish/neutral/bearish), score (-100 to 100), drivers, contrarian_signals.`;
    const result = await this.analyze(prompt);
    return { type: 'sentiment', data: result };
  }
}

module.exports = { CryptoAgent };

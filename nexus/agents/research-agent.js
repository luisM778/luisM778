const { BaseAgent } = require('./base-agent');

class ResearchAgent extends BaseAgent {
  constructor(llm, memory) {
    super('ResearchAgent', llm, memory);
    this.description = 'Investigates business opportunities, market trends, and competitive intelligence';
    this.capabilities = ['web_research', 'trend_analysis', 'competitor_analysis', 'opportunity_discovery'];
  }

  async run(task) {
    const { action, params = {} } = task;

    switch (params.type || 'general') {
      case 'market_research':
        return this.marketResearch(params);
      case 'competitor_analysis':
        return this.competitorAnalysis(params);
      case 'opportunity_scan':
        return this.opportunityScan(params);
      default:
        return this.generalResearch(params);
    }
  }

  async marketResearch(params) {
    const prompt = `Conduct a market research analysis for: ${params.topic || 'general market'}
Consider: market size, growth rate, key players, trends, and entry barriers.
Respond in JSON with keys: summary, market_size, growth_rate, key_players, trends, barriers, opportunities.`;
    const result = await this.analyze(prompt);
    await this.memory.storeInsight({ type: 'market_research', topic: params.topic, data: result });
    return { type: 'market_research', data: result };
  }

  async competitorAnalysis(params) {
    const prompt = `Analyze competitors in the sector: ${params.sector || 'technology'}
Identify: top competitors, their strengths/weaknesses, pricing strategies, market share.
Respond in JSON with keys: competitors (array of { name, strengths, weaknesses, pricing, market_share }).`;
    const result = await this.analyze(prompt);
    return { type: 'competitor_analysis', data: result };
  }

  async opportunityScan(params) {
    const prompt = `Scan for business opportunities in: ${params.domain || 'technology'}
Consider: emerging niches, underserved markets, technology gaps, regulatory changes.
Respond in JSON with keys: opportunities (array of { title, description, potential, risk, timeframe }).`;
    const result = await this.analyze(prompt);
    await this.memory.storeInsight({ type: 'opportunity', data: result });
    return { type: 'opportunity_scan', data: result };
  }

  async generalResearch(params) {
    const prompt = `Research the following topic thoroughly: ${params.query || params.topic || 'current business trends'}
Provide a comprehensive analysis with actionable insights.
Respond in JSON with keys: summary, key_findings (array), recommendations (array), sources_suggested (array).`;
    const result = await this.analyze(prompt);
    return { type: 'general_research', data: result };
  }
}

module.exports = { ResearchAgent };

const { BaseAgent } = require('./base-agent');

class SalesAgent extends BaseAgent {
  constructor(llm, memory) {
    super('SalesAgent', llm, memory);
    this.description = 'Monitors sales performance, identifies leads, and optimizes revenue strategies';
    this.capabilities = ['sales_analysis', 'lead_scoring', 'forecast', 'pricing_strategy'];
  }

  async run(task) {
    const { params = {} } = task;

    switch (params.type || 'analysis') {
      case 'analysis':
        return this.salesAnalysis(params);
      case 'lead_scoring':
        return this.scoreLead(params);
      case 'forecast':
        return this.salesForecast(params);
      case 'pricing':
        return this.pricingStrategy(params);
      default:
        return this.salesAnalysis(params);
    }
  }

  async salesAnalysis(params) {
    const prompt = `Analyze sales performance for period: ${params.period || 'current month'}
Product/Service: ${params.product || 'all products'}
Consider: revenue, units sold, growth rate, top products, customer segments.
Respond in JSON with keys: summary, total_revenue, growth_rate, top_products, segments, recommendations.`;
    const result = await this.analyze(prompt);
    return { type: 'sales_analysis', data: result };
  }

  async scoreLead(params) {
    const prompt = `Score the following lead:
Company: ${params.company || 'N/A'}
Industry: ${params.industry || 'N/A'}
Size: ${params.size || 'N/A'}
Interest: ${params.interest || 'N/A'}
Score from 1-100 and explain reasoning.
Respond in JSON with keys: score, tier (hot/warm/cold), reasoning, recommended_approach, estimated_value.`;
    const result = await this.analyze(prompt);
    return { type: 'lead_score', data: result };
  }

  async salesForecast(params) {
    const prompt = `Create a sales forecast for: ${params.period || 'next quarter'}
Based on: ${params.context || 'historical trends'}
Respond in JSON with keys: forecast_period, projected_revenue, confidence, assumptions, risks, scenarios (best/base/worst).`;
    const result = await this.analyze(prompt);
    return { type: 'sales_forecast', data: result };
  }

  async pricingStrategy(params) {
    const prompt = `Recommend pricing strategy for: ${params.product || 'product'}
Market: ${params.market || 'general'}
Current price: ${params.current_price || 'N/A'}
Respond in JSON with keys: recommended_price, strategy_type, reasoning, competitor_comparison, expected_impact.`;
    const result = await this.analyze(prompt);
    return { type: 'pricing_strategy', data: result };
  }
}

module.exports = { SalesAgent };

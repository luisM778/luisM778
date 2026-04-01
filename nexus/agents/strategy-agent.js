const { BaseAgent } = require('./base-agent');

class StrategyAgent extends BaseAgent {
  constructor(llm, memory) {
    super('StrategyAgent', llm, memory);
    this.description = 'Coordinates strategic planning, generates reports, and synthesizes insights from all agents';
    this.capabilities = ['strategic_planning', 'report_generation', 'swot_analysis', 'okr_tracking'];
  }

  async run(task) {
    const { params = {} } = task;

    switch (params.type || 'report') {
      case 'report':
        return this.generateReport(params);
      case 'swot':
        return this.swotAnalysis(params);
      case 'strategic_plan':
        return this.strategicPlan(params);
      case 'daily_briefing':
        return this.dailyBriefing(params);
      default:
        return this.generateReport(params);
    }
  }

  async generateReport(params) {
    const recentInsights = await this.memory.getRecentInsights(20);
    const prompt = `Generate an executive report based on recent intelligence data.
Period: ${params.period || 'last 24 hours'}
Recent insights: ${JSON.stringify(recentInsights)}

Respond in JSON with keys: title, executive_summary, key_metrics, highlights, risks, action_items, next_steps.`;
    const result = await this.analyze(prompt);
    return { type: 'executive_report', data: result };
  }

  async swotAnalysis(params) {
    const prompt = `Perform SWOT analysis for: ${params.subject || 'the business'}
Context: ${params.context || 'general business environment'}
Respond in JSON with keys: strengths (array), weaknesses (array), opportunities (array), threats (array), strategic_implications.`;
    const result = await this.analyze(prompt);
    return { type: 'swot', data: result };
  }

  async strategicPlan(params) {
    const prompt = `Create a strategic plan for: ${params.objective || 'business growth'}
Timeframe: ${params.timeframe || 'next quarter'}
Respond in JSON with keys: objective, timeframe, initiatives (array of { name, description, owner, milestones, kpis }), resources_needed, risks.`;
    const result = await this.analyze(prompt);
    return { type: 'strategic_plan', data: result };
  }

  async dailyBriefing(params) {
    const recentInsights = await this.memory.getRecentInsights(50);
    const prompt = `Create a daily business briefing for an executive.
Date: ${new Date().toISOString().split('T')[0]}
Available intelligence: ${JSON.stringify(recentInsights)}

Respond in JSON with keys: date, greeting, top_priorities (max 3), market_update, financial_snapshot, action_items, calendar_suggestions.`;
    const result = await this.analyze(prompt);
    return { type: 'daily_briefing', data: result };
  }
}

module.exports = { StrategyAgent };

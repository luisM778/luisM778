const { BaseAgent } = require('./base-agent');

class FinanceAgent extends BaseAgent {
  constructor(llm, memory) {
    super('FinanceAgent', llm, memory);
    this.description = 'Monitors financial metrics, cash flow, budgets, and profitability analysis';
    this.capabilities = ['financial_analysis', 'cash_flow', 'budget_review', 'profitability', 'expense_audit'];
  }

  async run(task) {
    const { params = {} } = task;

    switch (params.type || 'analysis') {
      case 'analysis':
        return this.financialAnalysis(params);
      case 'cash_flow':
        return this.cashFlowAnalysis(params);
      case 'budget':
        return this.budgetReview(params);
      case 'profitability':
        return this.profitabilityAnalysis(params);
      default:
        return this.financialAnalysis(params);
    }
  }

  async financialAnalysis(params) {
    const prompt = `Perform financial analysis for: ${params.entity || 'company'}
Period: ${params.period || 'current quarter'}
Consider: revenue, expenses, margins, key ratios (ROI, ROE, debt-to-equity).
Respond in JSON with keys: summary, revenue, expenses, net_income, margins, ratios, health_score (1-100), alerts.`;
    const result = await this.analyze(prompt);
    return { type: 'financial_analysis', data: result };
  }

  async cashFlowAnalysis(params) {
    const prompt = `Analyze cash flow for: ${params.period || 'current month'}
Identify: inflows, outflows, net cash flow, burn rate, runway.
Respond in JSON with keys: inflows, outflows, net_cash_flow, burn_rate, runway_months, recommendations.`;
    const result = await this.analyze(prompt);
    return { type: 'cash_flow', data: result };
  }

  async budgetReview(params) {
    const prompt = `Review budget allocation for: ${params.department || 'all departments'}
Period: ${params.period || 'current quarter'}
Identify: over/under spending, optimization opportunities.
Respond in JSON with keys: total_budget, spent, remaining, variance, over_budget_items, optimization_suggestions.`;
    const result = await this.analyze(prompt);
    return { type: 'budget_review', data: result };
  }

  async profitabilityAnalysis(params) {
    const prompt = `Analyze profitability for: ${params.product || 'all products'}
Consider: gross margin, contribution margin, break-even, cost structure.
Respond in JSON with keys: products (array of { name, revenue, cost, gross_margin, contribution_margin }), recommendations.`;
    const result = await this.analyze(prompt);
    return { type: 'profitability', data: result };
  }
}

module.exports = { FinanceAgent };

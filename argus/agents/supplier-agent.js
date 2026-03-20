const { BaseAgent } = require('./base-agent');

class SupplierAgent extends BaseAgent {
  constructor(llm, memory) {
    super('SupplierAgent', llm, memory);
    this.description = 'Manages supplier relationships, sourcing, and supply chain intelligence';
    this.capabilities = ['supplier_search', 'price_comparison', 'supply_chain_analysis', 'vendor_evaluation'];
  }

  async run(task) {
    const { params = {} } = task;

    switch (params.type || 'search') {
      case 'search':
        return this.searchSuppliers(params);
      case 'evaluate':
        return this.evaluateSupplier(params);
      case 'compare_prices':
        return this.comparePrices(params);
      case 'supply_chain':
        return this.analyzeSupplyChain(params);
      default:
        return this.searchSuppliers(params);
    }
  }

  async searchSuppliers(params) {
    const prompt = `Find potential suppliers for: ${params.product || 'general products'}
Region: ${params.region || 'global'}
Consider: quality, price, reliability, lead time, MOQ.
Respond in JSON with keys: suppliers (array of { name, region, speciality, estimated_price_range, lead_time, rating }).`;
    const result = await this.analyze(prompt);
    return { type: 'supplier_search', data: result };
  }

  async evaluateSupplier(params) {
    const prompt = `Evaluate supplier: ${params.supplier_name || 'unknown'}
Criteria: quality (1-10), reliability (1-10), pricing (1-10), communication (1-10), lead_time (1-10).
Respond in JSON with keys: supplier, scores, overall_score, recommendation, risks.`;
    const result = await this.analyze(prompt);
    return { type: 'supplier_evaluation', data: result };
  }

  async comparePrices(params) {
    const prompt = `Compare prices for product: ${params.product || 'unknown'}
Quantity: ${params.quantity || 'N/A'}
Provide price comparison across different supplier tiers.
Respond in JSON with keys: product, comparisons (array of { supplier, unit_price, bulk_price, moq, shipping }).`;
    const result = await this.analyze(prompt);
    return { type: 'price_comparison', data: result };
  }

  async analyzeSupplyChain(params) {
    const prompt = `Analyze supply chain for: ${params.product || 'product'}
Identify: bottlenecks, risks, optimization opportunities, alternative routes.
Respond in JSON with keys: chain_summary, bottlenecks, risks, optimizations, alternatives.`;
    const result = await this.analyze(prompt);
    return { type: 'supply_chain_analysis', data: result };
  }
}

module.exports = { SupplierAgent };

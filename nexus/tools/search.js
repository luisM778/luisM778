const axios = require('axios');
const { logger } = require('../core/logger');

class SearchTool {
  constructor() {
    this.baseUrl = 'https://api.duckduckgo.com';
  }

  /**
   * Search using DuckDuckGo Instant Answer API (no API key needed)
   */
  async search(query) {
    logger.info(`Searching: ${query}`);

    try {
      const response = await axios.get(this.baseUrl, {
        params: { q: query, format: 'json', no_redirect: 1 },
        timeout: 10000,
      });

      const data = response.data;
      const results = [];

      if (data.Abstract) {
        results.push({ title: data.Heading, snippet: data.Abstract, url: data.AbstractURL });
      }

      if (data.RelatedTopics) {
        for (const topic of data.RelatedTopics.slice(0, 10)) {
          if (topic.Text) {
            results.push({ title: topic.Text.slice(0, 80), snippet: topic.Text, url: topic.FirstURL });
          }
        }
      }

      return { query, results, total: results.length };
    } catch (err) {
      logger.error(`Search failed: ${err.message}`);
      return { query, results: [], total: 0, error: err.message };
    }
  }
}

module.exports = { SearchTool };

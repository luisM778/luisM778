const axios = require('axios');
const { logger } = require('./logger');

/**
 * LLMClient – interface to Ollama local models
 */
class LLMClient {
  constructor() {
    this.baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    this.model = process.env.OLLAMA_MODEL || 'llama3.1';
    this.embedModel = process.env.OLLAMA_EMBED_MODEL || 'nomic-embed-text';
  }

  async generate(prompt, options = {}) {
    try {
      const response = await axios.post(`${this.baseUrl}/api/generate`, {
        model: options.model || this.model,
        prompt,
        stream: false,
        options: {
          temperature: options.temperature ?? 0.7,
          num_predict: options.maxTokens ?? 2048,
        },
      });
      return response.data.response;
    } catch (err) {
      logger.error('LLM generation failed', { error: err.message });
      throw new Error(`LLM generation failed: ${err.message}`);
    }
  }

  async chat(messages, options = {}) {
    try {
      const response = await axios.post(`${this.baseUrl}/api/chat`, {
        model: options.model || this.model,
        messages,
        stream: false,
        options: {
          temperature: options.temperature ?? 0.7,
          num_predict: options.maxTokens ?? 2048,
        },
      });
      return response.data.message.content;
    } catch (err) {
      logger.error('LLM chat failed', { error: err.message });
      throw new Error(`LLM chat failed: ${err.message}`);
    }
  }

  async embed(text) {
    try {
      const response = await axios.post(`${this.baseUrl}/api/embeddings`, {
        model: this.embedModel,
        prompt: text,
      });
      return response.data.embedding;
    } catch (err) {
      logger.error('LLM embedding failed', { error: err.message });
      throw new Error(`LLM embedding failed: ${err.message}`);
    }
  }
}

module.exports = { LLMClient };

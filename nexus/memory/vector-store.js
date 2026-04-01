const { ChromaClient } = require('chromadb');
const { logger } = require('../core/logger');

class VectorStore {
  constructor() {
    this.client = null;
    this.collection = null;
    this.collectionName = 'nexus_memory';
  }

  async connect() {
    try {
      this.client = new ChromaClient({
        path: `http://${process.env.CHROMA_HOST || 'localhost'}:${process.env.CHROMA_PORT || 8000}`,
      });

      this.collection = await this.client.getOrCreateCollection({
        name: this.collectionName,
        metadata: { description: 'NEXUS long-term vector memory' },
      });

      logger.info(`VectorStore connected: collection "${this.collectionName}"`);
    } catch (err) {
      logger.warn(`VectorStore connection failed: ${err.message}. Running without vector memory.`);
      this.collection = null;
    }
  }

  async add(id, document, metadata = {}) {
    if (!this.collection) return;
    try {
      await this.collection.add({
        ids: [id],
        documents: [document],
        metadatas: [metadata],
      });
    } catch (err) {
      logger.error(`VectorStore add failed: ${err.message}`);
    }
  }

  async query(queryText, nResults = 5) {
    if (!this.collection) return [];
    try {
      const results = await this.collection.query({
        queryTexts: [queryText],
        nResults,
      });
      return results.documents?.[0] || [];
    } catch (err) {
      logger.error(`VectorStore query failed: ${err.message}`);
      return [];
    }
  }
}

module.exports = { VectorStore };

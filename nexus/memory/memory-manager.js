const { Sequelize, DataTypes } = require('sequelize');
const Redis = require('ioredis');
const { VectorStore } = require('./vector-store');
const { logger } = require('../core/logger');

class MemoryManager {
  constructor() {
    this.sequelize = null;
    this.redis = null;
    this.vectorStore = null;
    this.models = {};
  }

  async connect() {
    logger.info('Connecting memory systems...');

    // PostgreSQL
    this.sequelize = new Sequelize(
      process.env.POSTGRES_DB || 'nexus',
      process.env.POSTGRES_USER || 'nexus',
      process.env.POSTGRES_PASSWORD || 'nexus_secret_2024',
      {
        host: process.env.POSTGRES_HOST || 'localhost',
        port: process.env.POSTGRES_PORT || 5432,
        dialect: 'postgres',
        logging: false,
      }
    );

    await this.sequelize.authenticate();
    logger.info('PostgreSQL connected');

    // Define models
    this.defineModels();
    await this.sequelize.sync();

    // Redis
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      maxRetriesPerRequest: 3,
    });
    logger.info('Redis connected');

    // ChromaDB vector store
    this.vectorStore = new VectorStore();
    await this.vectorStore.connect();
    logger.info('VectorStore connected');
  }

  defineModels() {
    this.models.Client = this.sequelize.define('Client', {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      name: DataTypes.STRING,
      email: DataTypes.STRING,
      company: DataTypes.STRING,
      segment: DataTypes.STRING,
      metadata: DataTypes.JSONB,
    });

    this.models.Sale = this.sequelize.define('Sale', {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      clientId: DataTypes.UUID,
      product: DataTypes.STRING,
      amount: DataTypes.DECIMAL(12, 2),
      currency: { type: DataTypes.STRING, defaultValue: 'USD' },
      status: { type: DataTypes.STRING, defaultValue: 'pending' },
      metadata: DataTypes.JSONB,
    });

    this.models.Supplier = this.sequelize.define('Supplier', {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      name: DataTypes.STRING,
      region: DataTypes.STRING,
      category: DataTypes.STRING,
      rating: DataTypes.FLOAT,
      contact: DataTypes.JSONB,
      metadata: DataTypes.JSONB,
    });

    this.models.Product = this.sequelize.define('Product', {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      name: DataTypes.STRING,
      category: DataTypes.STRING,
      price: DataTypes.DECIMAL(12, 2),
      cost: DataTypes.DECIMAL(12, 2),
      stock: DataTypes.INTEGER,
      metadata: DataTypes.JSONB,
    });

    this.models.Task = this.sequelize.define('Task', {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      agent: DataTypes.STRING,
      action: DataTypes.STRING,
      status: { type: DataTypes.STRING, defaultValue: 'pending' },
      result: DataTypes.JSONB,
      duration: DataTypes.INTEGER,
    });

    this.models.Insight = this.sequelize.define('Insight', {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      type: DataTypes.STRING,
      data: DataTypes.JSONB,
    });

    this.models.Opportunity = this.sequelize.define('Opportunity', {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      title: DataTypes.STRING,
      description: DataTypes.TEXT,
      source: DataTypes.STRING,
      potential: DataTypes.STRING,
      risk: DataTypes.STRING,
      status: { type: DataTypes.STRING, defaultValue: 'new' },
      metadata: DataTypes.JSONB,
    });
  }

  // --- Short-term memory (Redis) ---

  async cacheSet(key, value, ttlSeconds = 3600) {
    await this.redis.set(`nexus:${key}`, JSON.stringify(value), 'EX', ttlSeconds);
  }

  async cacheGet(key) {
    const data = await this.redis.get(`nexus:${key}`);
    return data ? JSON.parse(data) : null;
  }

  // --- Structured data (PostgreSQL) ---

  async storeTaskResult(taskData) {
    return this.models.Task.create(taskData);
  }

  async getRecentTasks(limit = 10) {
    return this.models.Task.findAll({ order: [['createdAt', 'DESC']], limit });
  }

  async storeInsight(insightData) {
    const record = await this.models.Insight.create(insightData);
    // Also store in vector memory for semantic search
    if (this.vectorStore) {
      await this.vectorStore.add(
        record.id,
        JSON.stringify(insightData.data || insightData),
        { type: insightData.type }
      );
    }
    return record;
  }

  async getRecentInsights(limit = 20) {
    return this.models.Insight.findAll({ order: [['createdAt', 'DESC']], limit });
  }

  async storeOpportunity(data) {
    return this.models.Opportunity.create(data);
  }

  async getOpportunities(status = null) {
    const where = status ? { status } : {};
    return this.models.Opportunity.findAll({ where, order: [['createdAt', 'DESC']] });
  }

  // --- Vector memory (ChromaDB) ---

  async semanticSearch(query, limit = 5) {
    if (!this.vectorStore) return [];
    return this.vectorStore.query(query, limit);
  }
}

module.exports = { MemoryManager };

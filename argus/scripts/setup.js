#!/usr/bin/env node
/**
 * ARGUS Setup Script
 * Pulls required Ollama models and verifies services.
 */
const axios = require('axios');

const OLLAMA_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';

const models = [
  process.env.OLLAMA_MODEL || 'llama3.1',
  process.env.OLLAMA_EMBED_MODEL || 'nomic-embed-text',
];

async function pullModel(name) {
  console.log(`Pulling model: ${name}...`);
  try {
    await axios.post(`${OLLAMA_URL}/api/pull`, { name, stream: false });
    console.log(`✓ ${name} ready`);
  } catch (err) {
    console.error(`✗ Failed to pull ${name}: ${err.message}`);
  }
}

async function checkService(name, url) {
  try {
    await axios.get(url, { timeout: 5000 });
    console.log(`✓ ${name} is running`);
    return true;
  } catch {
    console.log(`✗ ${name} is not available at ${url}`);
    return false;
  }
}

async function main() {
  console.log('=== ARGUS Setup ===\n');

  console.log('Checking services...');
  await checkService('Ollama', OLLAMA_URL);
  await checkService('PostgreSQL', `http://localhost:${process.env.POSTGRES_PORT || 5432}`);
  await checkService('Redis', `http://localhost:${process.env.REDIS_PORT || 6379}`);
  await checkService('ChromaDB', `http://localhost:${process.env.CHROMA_PORT || 8000}`);

  console.log('\nPulling AI models...');
  for (const model of models) {
    await pullModel(model);
  }

  console.log('\n=== Setup complete ===');
}

main();

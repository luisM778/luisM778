require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { Telegraf } = require('telegraf');
const axios = require('axios');
const { logger } = require('../core/logger');

const API_BASE = `http://localhost:${process.env.PORT || 4000}/api`;
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

bot.start((ctx) => {
  ctx.reply(
    '🤖 *NEXUS - Autonomous Business Assistant*\n\n' +
      'Commands:\n' +
      '/agents - List active agents\n' +
      '/tasks - View recent tasks\n' +
      '/opportunities - View business opportunities\n' +
      '/research <topic> - Start research\n' +
      '/market - Market overview\n' +
      '/crypto - Crypto market status\n' +
      '/report - Generate daily report\n' +
      '/status - System status',
    { parse_mode: 'Markdown' }
  );
});

bot.command('agents', async (ctx) => {
  try {
    const { data } = await axios.get(`${API_BASE}/agents`);
    const list = data.agents.map((a) => `• *${a.name}*: ${a.description}`).join('\n');
    ctx.reply(`📋 *Active Agents:*\n\n${list}`, { parse_mode: 'Markdown' });
  } catch (err) {
    ctx.reply(`❌ Error: ${err.message}`);
  }
});

bot.command('tasks', async (ctx) => {
  try {
    const { data } = await axios.get(`${API_BASE}/tasks?limit=5`);
    const list = data.tasks
      .map((t) => `• [${t.status}] ${t.agent}: ${t.action}`)
      .join('\n');
    ctx.reply(`📋 *Recent Tasks:*\n\n${list || 'No tasks yet'}`, { parse_mode: 'Markdown' });
  } catch (err) {
    ctx.reply(`❌ Error: ${err.message}`);
  }
});

bot.command('opportunities', async (ctx) => {
  try {
    const { data } = await axios.get(`${API_BASE}/opportunities`);
    const list = data.opportunities
      .slice(0, 5)
      .map((o) => `• *${o.title}*: ${o.description?.slice(0, 80) || 'N/A'}`)
      .join('\n');
    ctx.reply(`💡 *Opportunities:*\n\n${list || 'No opportunities yet'}`, { parse_mode: 'Markdown' });
  } catch (err) {
    ctx.reply(`❌ Error: ${err.message}`);
  }
});

bot.command('research', async (ctx) => {
  const topic = ctx.message.text.replace('/research', '').trim();
  if (!topic) return ctx.reply('Usage: /research <topic>');

  ctx.reply(`🔍 Researching: "${topic}"...`);
  try {
    const { data } = await axios.post(`${API_BASE}/agents/research/execute`, {
      action: 'research',
      params: { type: 'general', query: topic },
    });
    ctx.reply(`📊 *Research Result:*\n\n${JSON.stringify(data.result, null, 2).slice(0, 3000)}`, {
      parse_mode: 'Markdown',
    });
  } catch (err) {
    ctx.reply(`❌ Error: ${err.message}`);
  }
});

bot.command('crypto', async (ctx) => {
  ctx.reply('📈 Fetching crypto market data...');
  try {
    const { data } = await axios.post(`${API_BASE}/agents/crypto/execute`, {
      action: 'market_monitor',
      params: { type: 'monitor' },
    });
    ctx.reply(`📊 *Crypto Market:*\n\n${JSON.stringify(data.result, null, 2).slice(0, 3000)}`, {
      parse_mode: 'Markdown',
    });
  } catch (err) {
    ctx.reply(`❌ Error: ${err.message}`);
  }
});

bot.command('report', async (ctx) => {
  ctx.reply('📝 Generating daily report...');
  try {
    const { data } = await axios.post(`${API_BASE}/agents/strategy/execute`, {
      action: 'daily_briefing',
      params: { type: 'daily_briefing' },
    });
    ctx.reply(`📊 *Daily Report:*\n\n${JSON.stringify(data.result, null, 2).slice(0, 3000)}`, {
      parse_mode: 'Markdown',
    });
  } catch (err) {
    ctx.reply(`❌ Error: ${err.message}`);
  }
});

bot.command('status', async (ctx) => {
  try {
    const healthRes = await axios.get(`http://localhost:${process.env.PORT || 4000}/health`);
    ctx.reply(
      `✅ *NEXUS Status*\n\n` +
        `Service: ${healthRes.data.service}\n` +
        `Status: ${healthRes.data.status}\n` +
        `Time: ${healthRes.data.timestamp}`,
      { parse_mode: 'Markdown' }
    );
  } catch (err) {
    ctx.reply('❌ NEXUS is offline');
  }
});

// Handle plain text as questions to strategy agent
bot.on('text', async (ctx) => {
  const question = ctx.message.text;
  ctx.reply('🤔 Processing your question...');
  try {
    const { data } = await axios.post(`${API_BASE}/agents/strategy/execute`, {
      action: 'answer',
      params: { type: 'report', query: question },
    });
    ctx.reply(JSON.stringify(data.result, null, 2).slice(0, 3000));
  } catch (err) {
    ctx.reply(`❌ Error: ${err.message}`);
  }
});

bot.launch().then(() => logger.info('Telegram bot started'));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

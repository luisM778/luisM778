const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const { logger } = require('../core/logger');

class BrowserTool {
  constructor() {
    this.browser = null;
  }

  async getBrowser() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
      });
    }
    return this.browser;
  }

  async scrape(url, selector = 'body') {
    logger.info(`Scraping: ${url}`);
    const browser = await this.getBrowser();
    const page = await browser.newPage();

    try {
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      );
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

      const html = await page.content();
      const $ = cheerio.load(html);

      // Remove script/style tags
      $('script, style, nav, footer, header').remove();

      const text = $(selector).text().replace(/\s+/g, ' ').trim();
      const title = $('title').text().trim();
      const metaDesc = $('meta[name="description"]').attr('content') || '';

      return { url, title, description: metaDesc, content: text.slice(0, 10000) };
    } finally {
      await page.close();
    }
  }

  async screenshot(url) {
    const browser = await this.getBrowser();
    const page = await browser.newPage();

    try {
      await page.setViewport({ width: 1280, height: 720 });
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      const buffer = await page.screenshot({ encoding: 'base64' });
      return { url, screenshot: buffer };
    } finally {
      await page.close();
    }
  }

  async extractData(url, schema = {}) {
    const { content } = await this.scrape(url);
    return { url, content, schema };
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

module.exports = { BrowserTool };

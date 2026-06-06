const BaseProvider = require('./base.provider');
const puppeteer = require('puppeteer');

class CyberpuertaProvider extends BaseProvider {
  constructor() {
    super('cyberpuerta');
  }

  async search(query) {
    let browser;
    try {
      browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      await page.setRequestInterception(true);
      page.on('request', (req) => {
        const resourceType = req.resourceType();
        if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
          req.abort();
        } else {
          req.continue();
        }
      });
      const url = `https://www.cyberpuerta.mx/?q=${encodeURIComponent(query.q)}`;
      await page.goto(url, { waitUntil: 'networkidle2' });

      const products = await page.evaluate(() => {
        const items = [];
        const elements = document.querySelectorAll('.emproduct');
        elements.forEach((el, index) => {
          if (index >= 10) return;
          const titleEl = el.querySelector('.emproduct_right_title h2 a');
          const title = titleEl ? titleEl.textContent.trim() : '';
          const priceEl = el.querySelector('.price');
          const price = priceEl ? parseFloat(priceEl.textContent.replace(/[^\d.,]/g, '').replace(',', '.')) : null;
          const imageEl = el.querySelector('.emproduct_left img') || el.querySelector('img');
          const image = imageEl ? imageEl.src || imageEl.getAttribute('data-src') || '' : '';
          const linkEl = el.querySelector('.emproduct_right_title h2 a');
          const link = linkEl ? linkEl.href : '';

          if (title && price) {
            items.push({
              id: `cyber-${query.q}-${index}`,
              title,
              description: title,
              provider: 'cyberpuerta',
              image,
              price,
              rating: null,
              url: link,
              category: query.category || 'general',
              specs: {}
            });
          }
        });
        return items;
      });

      console.log(`Cyberpuerta: Encontrados ${products.length} productos`);
      return products;
    } catch (error) {
      console.error('Error scraping Cyberpuerta:', error.message);
      return [];
    } finally {
      if (browser) await browser.close();
    }
  }
}

module.exports = new CyberpuertaProvider();

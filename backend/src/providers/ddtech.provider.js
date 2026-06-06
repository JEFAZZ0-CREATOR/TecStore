const BaseProvider = require('./base.provider');
const puppeteer = require('puppeteer');

class DDTechProvider extends BaseProvider {
  constructor() {
    super('ddtech');
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
      const url = `https://www.ddtech.mx/buscar?q=${encodeURIComponent(query.q)}`;
      await page.goto(url, { waitUntil: 'networkidle2' });

      const products = await page.evaluate(() => {
        const items = [];
        const elements = document.querySelectorAll('.product-item');
        elements.forEach((el, index) => {
          if (index >= 10) return;
          const titleEl = el.querySelector('.product-title a');
          const title = titleEl ? titleEl.textContent.trim() : '';
          const priceEl = el.querySelector('.price');
          const price = priceEl ? parseFloat(priceEl.textContent.replace(/[^\d.,]/g, '').replace(',', '.')) : null;
          const imageEl = el.querySelector('.product-image img') || el.querySelector('img');
          const image = imageEl ? imageEl.src || imageEl.getAttribute('data-src') || '' : '';
          const linkEl = el.querySelector('.product-title a');
          const link = linkEl ? linkEl.href : '';

          if (title && price) {
            items.push({
              id: `ddtech-${query.q}-${index}`,
              title,
              description: title,
              provider: 'ddtech',
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

      console.log(`DDTech: Encontrados ${products.length} productos`);
      return products;
    } catch (error) {
      console.error('Error scraping DDTech:', error.message);
      return [];
    } finally {
      if (browser) await browser.close();
    }
  }
}

module.exports = new DDTechProvider();

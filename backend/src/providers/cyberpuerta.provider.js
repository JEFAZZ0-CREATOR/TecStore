const BaseProvider = require('./base.provider');
const puppeteer = require('puppeteer');

class CyberpuertaProvider extends BaseProvider {
  constructor() {
    super('cyberpuerta');
  }

  async search(query) {
    let browser;
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security'],
      });
      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      await page.setRequestInterception(true);
      page.on('request', (req) => {
        const resourceType = req.resourceType();
        if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
          req.abort();
        } else {
          req.continue();
        }
      });

      const pageNum = query.page || 1;
      const url = `https://www.cyberpuerta.mx/?q=${encodeURIComponent(query.q)}&page=${pageNum}`;
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
      await page.waitForSelector('.cpd-product-card-catalog', { timeout: 15000 });
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const categoryValue = query.category || 'hardware';
      const products = await page.evaluate((category) => {
        return Array.from(document.querySelectorAll('.cpd-product-card-catalog')).slice(0, 50).map((card, index) => {
          const titleEl = card.querySelector('.cp-product-info-dne__name');
          const name = titleEl ? titleEl.textContent.trim() : '';
          const linkEl = card.querySelector('.cp-product-info-dne--catalog-grid');
          const imageEl = card.querySelector('.cp-product-image__image');
          const priceEl = card.querySelector('.cpd-product-card-catalog__price .cp-text--price-total');

          const rawPrice = priceEl ? priceEl.textContent.replace(/[^\d.,]/g, '') : '';
          const normalizedPrice = rawPrice.includes(',') && rawPrice.includes('.')
            ? rawPrice.replace(/,/g, '')
            : rawPrice.replace(/,/g, '.');
          const price = normalizedPrice ? parseFloat(normalizedPrice) : null;
          const link = linkEl ? linkEl.href : '';
          const image = imageEl ? imageEl.src || imageEl.getAttribute('data-src') || '' : '';

          return {
            id: `cyberpuerta-${index}`,
            title: name,
            description: name,
            provider: 'cyberpuerta',
            source: 'external',
            image,
            price: price || 0,
            originalPrice: null,
            discount: 0,
            rating: null,
            url: link,
            category,
            specs: {},
          };
        }).filter((item) => item.title && item.price && item.url);
      }, categoryValue);

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

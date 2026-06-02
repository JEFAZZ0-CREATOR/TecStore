const BaseProvider = require('./base.provider');
const puppeteer = require('puppeteer');

class MercadoLibreProvider extends BaseProvider {
  constructor() {
    super('mercadolibre');
  }

  async search(query) {
    let browser;
    try {
      browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      const url = `https://listado.mercadolibre.com.mx/${encodeURIComponent(query.q)}`;
      await page.goto(url, { waitUntil: 'networkidle2' });
      await page.waitForSelector('li.ui-search-layout__item', { timeout: 10000 });

      const products = await page.evaluate((query) => {
        const items = [];
        const elements = document.querySelectorAll('li.ui-search-layout__item');
        elements.forEach((el, index) => {
          if (index >= 5) return;
          const titleEl = el.querySelector('.ui-search-item__title');
          const title = titleEl ? titleEl.textContent.trim() : '';
          const priceEl = el.querySelector('.ui-search-price__second-line .price-tag-fraction');
          const price = priceEl ? parseFloat(priceEl.textContent.replace(/\./g, '').replace(',', '.')) : null;
          const imageEl = el.querySelector('.ui-search-result__image img');
          const image = imageEl ? imageEl.getAttribute('data-src') || imageEl.src : '';
          const linkEl = el.querySelector('.ui-search-link');
          const link = linkEl ? linkEl.href : '';

          if (title && price) {
            items.push({
              id: `mercado-${query.q}-${index}`,
              title,
              description: title,
              provider: 'mercadolibre',
              image,
              price,
              rating: null,
              url: link,
              category: query.category || 'general',
              specs: {}
            });
          }
        });
        return { items, count: elements.length };
      }, query);

      console.log(`Mercado Libre: Encontrados ${products.count} elementos, ${products.items.length} productos`);
      if (products.items.length === 0) {
        console.log('Mercado Libre: Usando fallback mock');
        return [
          {
            id: `mercado-${query.q}-fallback-0`,
            title: `Producto ${query.q} (Fallback)`,
            description: 'Producto de ejemplo - scraping no funcionó',
            provider: 'mercadolibre',
            image: 'https://via.placeholder.com/150',
            price: 149.99,
            rating: null,
            url: 'https://mercadolibre.com.mx',
            category: query.category || 'general',
            specs: {}
          }
        ];
      }
      return products.items;
    } catch (error) {
      console.error('Error scraping Mercado Libre:', error.message);
      return [];
    } finally {
      if (browser) await browser.close();
    }
  }
}

module.exports = new MercadoLibreProvider();

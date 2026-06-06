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
      await page.setRequestInterception(true);
      page.on('request', (req) => {
        const resourceType = req.resourceType();
        if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
          req.abort();
        } else {
          req.continue();
        }
      });
      const url = `https://listado.mercadolibre.com.mx/${encodeURIComponent(query.q)}`;
      await page.goto(url, { waitUntil: 'networkidle2' });
      await page.waitForSelector('li.ui-search-layout__item', { timeout: 10000 });

      const products = await page.evaluate((query) => {
        const items = [];
        const elements = document.querySelectorAll('li.ui-search-layout__item');
        elements.forEach((el, index) => {
          if (index >= 10) return;
          const titleEl = el.querySelector('.ui-search-item__title');
          const title = titleEl ? titleEl.textContent.trim() : '';
          const priceWholeEl = el.querySelector('.price-tag-fraction');
          const priceDecimalEl = el.querySelector('.price-tag-cents');
          let price = null;
          if (priceWholeEl) {
            const whole = priceWholeEl.textContent.replace(/\./g, '').trim();
            const cents = priceDecimalEl ? priceDecimalEl.textContent.replace(/\./g, '').trim() : '00';
            price = parseFloat(`${whole}.${cents.padStart(2, '0')}`);
          }
          const originalPriceText = el.querySelector('.price-tag-text-sr, .andes-money-amount__fraction')?.textContent || '';
          let originalPrice = null;
          if (originalPriceText) {
            originalPrice = parseFloat(originalPriceText.replace(/[^0-9.,]/g, '').replace(/\./g, '').replace(',', '.'));
          }
          const imageEl = el.querySelector('.ui-search-result__image img') || el.querySelector('img');
          const image = imageEl ? imageEl.getAttribute('data-src') || imageEl.src || imageEl.getAttribute('srcset')?.split(' ')[0] || '' : '';
          const linkEl = el.querySelector('.ui-search-link');
          const link = linkEl ? linkEl.href : '';
          const discount = originalPrice && price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

          if (title && price) {
            items.push({
              id: `mercado-${query.q}-${index}`,
              title,
              description: title,
              provider: 'mercadolibre',
              image,
              price,
              originalPrice,
              discount,
              rating: null,
              url: link,
              category: query.category || 'hardware',
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

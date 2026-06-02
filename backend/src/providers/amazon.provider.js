const BaseProvider = require('./base.provider');
const puppeteer = require('puppeteer');

class AmazonProvider extends BaseProvider {
  constructor() {
    super('amazon');
  }

  async search(query) {
    let browser;
    try {
      browser = await puppeteer.launch({ 
        headless: true, 
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security', '--disable-features=VizDisplayCompositor']
      });
      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      const url = `https://www.amazon.com.mx/s?k=${encodeURIComponent(query.q)}`;
      console.log(`Amazon: Navegando a ${url}`);
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

      // Esperar un poco más
      await new Promise(resolve => setTimeout(resolve, 2000));

      const products = await page.evaluate((query) => {
        const items = [];
        // Probar selectores alternativos
        let elements = document.querySelectorAll('div[data-component-type="s-search-result"]');
        if (elements.length === 0) {
          elements = document.querySelectorAll('div.s-result-item');
        }
        if (elements.length === 0) {
          elements = document.querySelectorAll('.s-search-results .s-result-item');
        }
        console.log(`Amazon evaluate: Encontrados ${elements.length} elementos`);
        elements.forEach((el, index) => {
          if (index >= 5) return;
          const titleEl = el.querySelector('h2 a span') || el.querySelector('.a-text-normal') || el.querySelector('h2 span');
          const title = titleEl ? titleEl.textContent.trim() : '';
          const priceWhole = el.querySelector('.a-price-whole');
          const priceFraction = el.querySelector('.a-price-fraction');
          const priceSymbol = el.querySelector('.a-price-symbol');
          let price = null;
          if (priceWhole && priceFraction) {
            price = parseFloat(priceWhole.textContent.trim() + '.' + priceFraction.textContent.trim());
          } else {
            const priceText = el.querySelector('.a-price .a-offscreen')?.textContent || el.querySelector('.a-color-price')?.textContent;
            if (priceText) {
              price = parseFloat(priceText.replace(/[^\d.,]/g, '').replace(',', '.'));
            }
          }
          const image = el.querySelector('img.s-image')?.src || '';
          const linkEl = el.querySelector('h2 a') || el.querySelector('a.a-link-normal');
          const link = linkEl ? 'https://www.amazon.com.mx' + linkEl.getAttribute('href') : '';
          const ratingEl = el.querySelector('.a-icon-star-small .a-icon-alt');
          const rating = ratingEl ? parseFloat(ratingEl.textContent.split(' ')[0]) : null;

          if (title && price) {
            items.push({
              id: `amazon-${query.q}-${index}`,
              title,
              description: title,
              provider: 'amazon',
              image,
              price,
              rating,
              url: link,
              category: query.category || 'general',
              specs: {}
            });
          }
        });
        return { items, count: elements.length };
      }, query);

      console.log(`Amazon: Encontrados ${products.count} elementos, ${products.items.length} productos válidos`);
      if (products.items.length === 0) {
        // Fallback temporal
        console.log('Amazon: Usando fallback mock');
        return [
          {
            id: `amazon-${query.q}-fallback-0`,
            title: `Teclado ${query.q} (Fallback)`,
            description: 'Producto de ejemplo - scraping no funcionó',
            provider: 'amazon',
            image: 'https://via.placeholder.com/150',
            price: 99.99,
            rating: 4.5,
            url: 'https://amazon.com.mx',
            category: query.category || 'general',
            specs: {}
          }
        ];
      }
      return products.items;
    } catch (error) {
      console.error('Error scraping Amazon:', error.message);
      // Fallback en error
      return [
        {
          id: `amazon-${query.q}-error-0`,
          title: `Error en Amazon: ${error.message}`,
          description: 'Producto de error',
          provider: 'amazon',
          image: '',
          price: 0,
          rating: null,
          url: '',
          category: query.category || 'general',
          specs: {}
        }
      ];
    } finally {
      if (browser) await browser.close();
    }
  }
}

module.exports = new AmazonProvider();

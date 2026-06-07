const BaseProvider = require('./base.provider');
const axios = require('axios');
const cheerio = require('cheerio');

class NeweggProvider extends BaseProvider {
  constructor() {
    super('newegg');
  }

  async search(query) {
    try {
      const page = query.page || 1;
      const url = `https://www.newegg.com/p/pl?d=${encodeURIComponent(query.q)}&PageSize=${query.perPage||50}&page=${page}`;
      const resp = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        timeout: 15000,
      });

      const $ = cheerio.load(resp.data);
      const items = [];
      $('.item-cell').each((i, el) => {
        if (i >= 50) return;
        const titleEl = $(el).find('.item-title').first();
        const title = titleEl.text().trim();
        const link = titleEl.attr('href') || '';
        const img = $(el).find('.item-img img').attr('src') || $(el).find('.item-img img').attr('data-src') || '';
        let priceText = $(el).find('.price-current strong').text() || $(el).find('.price-current').text();
        priceText = priceText.replace(/[^0-9.,]/g, '').replace(',', '.');
        const price = parseFloat(priceText) || 0;

        if (title && price && link) {
          items.push({
            id: `newegg-${i}-${title.substring(0,30)}`,
            title,
            description: title,
            provider: 'newegg',
            source: 'external',
            image: img,
            price,
            originalPrice: null,
            discount: 0,
            rating: null,
            available: true,
            url: link,
            category: query.category || 'general',
            specs: {},
          });
        }
      });

      console.log(`Newegg: Encontrados ${items.length} productos`);
      return items;
    } catch (error) {
      console.error('Error Newegg scrape:', error.message);
      return [];
    }
  }
}

module.exports = new NeweggProvider();

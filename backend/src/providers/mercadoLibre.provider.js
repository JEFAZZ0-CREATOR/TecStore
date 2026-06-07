const BaseProvider = require('./base.provider');
const axios = require('axios');

class MercadoLibreProvider extends BaseProvider {
  constructor() {
    super('mercadolibre');
  }

  async search(query) {
    try {
      const siteCandidates = ['MLM', 'MLA', 'MLB', 'MLC', 'MCO'];
      let results = [];
      for (const site of siteCandidates) {
        try {
          const url = `https://api.mercadolibre.com/sites/${site}/search?q=${encodeURIComponent(query.q)}&limit=50`;
          const response = await axios.get(url, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              Accept: 'application/json',
              'Accept-Language': 'es-MX,es;q=0.9',
              Referer: 'https://www.mercadolibre.com.mx/',
            },
            timeout: 10000,
          });

          results = response.data?.results || [];
          if (results && results.length > 0) {
            // stop on first successful site returning results
            break;
          }
        } catch (e) {
          // try next site
          console.warn(`MercadoLibre site ${site} failed:`, e.message);
          continue;
        }
      }

      return results.map((item) => {
        const originalPrice = item.original_price || item.price;
        const discount = item.original_price && item.price
          ? Math.round(((item.original_price - item.price) / item.original_price) * 100)
          : 0;

        return {
          id: item.id,
          title: item.title,
          description: item.title,
          provider: 'mercadolibre',
          image: item.thumbnail || item.thumbnail_id || '',
          price: item.price || 0,
          originalPrice: originalPrice !== item.price ? originalPrice : null,
          discount,
          rating: 0,
          available: true,
          url: item.permalink,
          category: query.category || item.category_id || 'general',
          specs: {
            condition: item.condition,
            shipping: item.shipping,
            soldQuantity: item.sold_quantity,
          },
        };
      });
    } catch (error) {
      console.error('Error Mercado Libre API:', error.message);
      return [];
    }
  }
}

module.exports = new MercadoLibreProvider();

const providers = require('../../providers');
const { normalizeProduct } = require('./search.normalizer');
const { cacheService } = require('../../cache/cache.service');
const AppError = require('../../shared/utils/AppError');

const allowedHardwareKeywords = [
  'cpu', 'procesador', 'amd', 'intel', 'ryzen', 'core', 'i7', 'i9', 'ryzen 5', 'ryzen 7', 'ryzen 9',
  'gpu', 'tarjeta gráfica', 'gráfica', 'video', 'geforce', 'rtx', 'gtx',
  'ram', 'memoria', 'ddr4', 'ddr5', 'ssd', 'hdd', 'nvme', 'disco', 'almacenamiento',
  'motherboard', 'placa madre', 'placa base', 'motherboard', 'mobo', 'placa',
  'teclado', 'mouse', 'ratón', 'audífonos', 'headset', 'monitor', 'pantalla',
  'gabinete', 'case', 'chasis', 'torre', 'fuente', 'power supply', 'cooler',
  'refrigeración', 'ventilador', 'keyboard', 'mousepad', 'webcam', 'parlante', 'speaker',
  'ssd', 'hdd', 'fuente', 'psu', 'fan', 'cable', 'monitor', 'pc', 'computadora', 'computador', 'gaming'
];

const normalizeText = (text = '') => text.toLowerCase().replace(/[^a-z0-9áéíóúñü ]+/g, ' ');
const matchesHardware = (text = '') => {
  const normalized = normalizeText(text);
  return allowedHardwareKeywords.some((keyword) => normalized.includes(keyword));
};

exports.searchProducts = async ({ q, category, minPrice, maxPrice, provider }) => {
  if (!q) {
    throw new AppError('El parámetro q es requerido', 400);
  }
  const cacheKey = `search:${q}:${category || ''}:${minPrice || ''}:${maxPrice || ''}:${provider || ''}`;
  const cached = cacheService.get(cacheKey);
  if (cached) {
    return cached;
  }

  const items = await providers.searchAll({ q, category, provider });
  const normalized = items.map(normalizeProduct);
  const filtered = normalized.filter((item) => {
    let keep = matchesHardware(item.title) || matchesHardware(item.description) || matchesHardware(item.category);
    if (category) keep = keep && item.category?.toLowerCase() === category.toLowerCase();
    if (minPrice) keep = keep && item.price >= Number(minPrice);
    if (maxPrice) keep = keep && item.price <= Number(maxPrice);
    return keep;
  });

  const sorted = filtered.sort((a, b) => {
    if ((b.discount || 0) !== (a.discount || 0)) return (b.discount || 0) - (a.discount || 0)
    return a.price - b.price
  });

  const limited = sorted.slice(0, 25)
  cacheService.set(cacheKey, limited, 30);
  return limited;
};

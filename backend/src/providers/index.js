const amazon = require('./amazon.provider');
const mercadoLibre = require('./mercadoLibre.provider');
const cyberpuerta = require('./cyberpuerta.provider');
const ddtech = require('./ddtech.provider');
const newegg = require('./newegg.provider');

// Default providers to use for general searches. Include external marketplaces for richer results.
const defaultProviders = [mercadoLibre, cyberpuerta, ddtech, newegg];
const providers = [amazon, mercadoLibre, cyberpuerta, ddtech, newegg];

const searchAll = async ({ q, category, provider, page = 1, perPage = 25 }) => {
  const selected = provider ? providers.filter((item) => item.name === provider) : defaultProviders;
  const results = await Promise.allSettled(
    selected.map((providerInstance) => providerInstance.search({ q, category, page, perPage }))
  );

  return results
    .filter((result) => result.status === 'fulfilled')
    .flatMap((result) => result.value || [])
    .filter(Boolean);
};

module.exports = { searchAll, providers };

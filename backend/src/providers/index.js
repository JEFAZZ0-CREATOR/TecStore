const amazon = require('./amazon.provider');
const mercadoLibre = require('./mercadoLibre.provider');
const cyberpuerta = require('./cyberpuerta.provider');
const ddtech = require('./ddtech.provider');

const providers = [amazon, mercadoLibre, cyberpuerta, ddtech];

const searchAll = async ({ q, category, provider }) => {
  const selected = provider ? providers.filter((item) => item.name === provider) : providers;
  const results = await Promise.allSettled(
    selected.map((providerInstance) => providerInstance.search({ q, category }))
  );

  return results
    .filter((result) => result.status === 'fulfilled')
    .flatMap((result) => result.value || [])
    .filter(Boolean);
};

module.exports = { searchAll, providers };

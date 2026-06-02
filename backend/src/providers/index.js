const amazon = require('./amazon.provider');
const mercadoLibre = require('./mercadoLibre.provider');
const cyberpuerta = require('./cyberpuerta.provider');
const ddtech = require('./ddtech.provider');

const providers = [amazon, mercadoLibre, cyberpuerta, ddtech];

const searchAll = async ({ q, category, provider }) => {
  const selected = provider ? providers.filter((item) => item.name === provider) : providers;
  const results = [];
  for (const providerInstance of selected) {
    const providerItems = await providerInstance.search({ q, category });
    results.push(...providerItems);
  }
  return results;
};

module.exports = { searchAll, providers };

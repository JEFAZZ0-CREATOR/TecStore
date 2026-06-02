exports.buildFilters = (query) => {
  return (item) => {
    let valid = true;
    if (query.provider) {
      valid = valid && item.provider?.toLowerCase() === query.provider.toLowerCase();
    }
    if (query.category) {
      valid = valid && item.category?.toLowerCase() === query.category.toLowerCase();
    }
    if (query.minPrice) {
      valid = valid && item.price >= Number(query.minPrice);
    }
    if (query.maxPrice) {
      valid = valid && item.price <= Number(query.maxPrice);
    }
    return valid;
  };
};

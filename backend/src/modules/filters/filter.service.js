const { buildFilters } = require('./filter.builder');

exports.applyFilters = (items, query) => items.filter(buildFilters(query));

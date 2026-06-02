const { cacheService } = require('../../cache/cache.service');

exports.getSearchCache = (key) => cacheService.get(key);
exports.setSearchCache = (key, value, ttl) => cacheService.set(key, value, ttl);

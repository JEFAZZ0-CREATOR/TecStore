const cacheStore = new Map();

exports.redisClient = {
  get: (key) => cacheStore.has(key) ? cacheStore.get(key) : null,
  set: (key, value, ttl) => {
    cacheStore.set(key, value);
    if (ttl) {
      setTimeout(() => cacheStore.delete(key), ttl * 1000);
    }
  },
  del: (key) => cacheStore.delete(key),
};

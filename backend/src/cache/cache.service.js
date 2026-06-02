const { redisClient } = require('./redisClient');

exports.cacheService = {
  get: (key) => redisClient.get(key),
  set: (key, value, ttl = 60) => redisClient.set(key, value, ttl),
  delete: (key) => redisClient.del(key),
};

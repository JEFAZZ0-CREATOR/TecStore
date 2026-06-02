const { cacheService } = require('../../cache/cache.service');

module.exports = (req, res, next) => {
  const key = `${req.method}:${req.originalUrl}`;
  const cached = cacheService.get(key);
  if (cached) {
    return res.json(cached);
  }
  const sendResponse = res.json.bind(res);
  res.json = (body) => {
    cacheService.set(key, body, 30);
    return sendResponse(body);
  };
  next();
};

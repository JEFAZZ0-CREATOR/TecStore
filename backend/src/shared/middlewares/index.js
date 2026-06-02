const authMiddleware = require('./auth.middleware');
const errorMiddleware = require('./error.middleware');
const validateMiddleware = require('./validate.middleware');
const cacheMiddleware = require('./cache.middleware');
const notFoundMiddleware = require('./notFound.middleware');

module.exports = {
  authMiddleware,
  errorHandler: errorMiddleware,
  validateRequest: validateMiddleware,
  cacheMiddleware,
  notFoundHandler: notFoundMiddleware,
};

module.exports = () => (req, res, next) => {
  const removeXss = (value) => {
    if (typeof value === 'string') {
      return value.replace(/<script.*?>.*?<\/script>/gi, '');
    }
    return value;
  };

  const sanitizeObject = (input) => {
    if (!input || typeof input !== 'object') return input;
    Object.keys(input).forEach((key) => {
      input[key] = removeXss(input[key]);
      if (typeof input[key] === 'object') sanitizeObject(input[key]);
    });
  };

  sanitizeObject(req.body);
  sanitizeObject(req.query);
  sanitizeObject(req.params);
  next();
};

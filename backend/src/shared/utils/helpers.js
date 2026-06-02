const crypto = require('crypto');

exports.hashPassword = (password) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

exports.comparePassword = (password, hash) => {
  return exports.hashPassword(password) === hash;
};

exports.generateId = () => crypto.randomUUID();

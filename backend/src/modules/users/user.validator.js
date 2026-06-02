const Joi = require('joi');

const userUpdateSchema = Joi.object({
  name: Joi.string().min(2).max(80),
  email: Joi.string().email(),
});

module.exports = { userUpdateSchema };

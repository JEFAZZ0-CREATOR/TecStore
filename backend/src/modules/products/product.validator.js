const Joi = require('joi');

const productCreateSchema = Joi.object({
  title: Joi.string().required(),
  price: Joi.number().positive().required(),
  provider: Joi.string().required(),
});

module.exports = { productCreateSchema };

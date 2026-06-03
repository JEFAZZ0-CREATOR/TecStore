const { PORT = 3000, NODE_ENV = 'development', JWT_SECRET = 'secret', MONGO_URI = 'mongodb://127.0.0.1:27017/virtual-store', STRIPE_SECRET = '' } = process.env;

module.exports = {
  PORT: Number(PORT),
  NODE_ENV,
  JWT_SECRET,
  MONGO_URI,
  STRIPE_SECRET,
};

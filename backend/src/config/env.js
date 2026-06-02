const dotenv = require('dotenv');
const path = require('path');

const initEnv = () => {
  const envFile = path.resolve(process.cwd(), '.env');
  dotenv.config({ path: envFile });
};

module.exports = { initEnv };

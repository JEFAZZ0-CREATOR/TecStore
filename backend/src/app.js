const express = require('express');
const cors = require('cors');
const helmet = require('./security/helmet');
const sanitize = require('./security/sanitize');
const xss = require('./security/xss');
const rateLimiter = require('./config/rateLimiter');
const logger = require('./config/logger');
const apiRouter = require('./api/v1');
const { notFoundHandler, errorHandler } = require('./shared/middlewares');
const { initEnv } = require('./config/env');
const { initTracing } = require('./monitoring/tracing');
const { connectMongo } = require('./config/mongo');

initEnv();

const app = express();

connectMongo();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(sanitize());
app.use(xss());
app.use(rateLimiter);
app.use(logger);
const path = require('path')
// Serve uploaded files (avatars)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/api/v1', apiRouter);
app.use('/metrics', require('./monitoring/metrics'));
app.use(notFoundHandler);
app.use(errorHandler);

initTracing(app);

module.exports = app;

const express = require('express');
const { register, login } = require('./auth.controller');
const { validateRequest } = require('../../shared/middlewares');
const { registerSchema, loginSchema } = require('./auth.validator');

const router = express.Router();
router.post('/register', validateRequest(registerSchema), register);
router.post('/login', validateRequest(loginSchema), login);

module.exports = router;

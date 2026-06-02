const express = require('express');
const { getProfile, listUsers, updateUser } = require('./user.controller');
const { authMiddleware } = require('../../shared/middlewares');
const { validateRequest } = require('../../shared/middlewares');
const { userUpdateSchema } = require('./user.validator');

const router = express.Router();
router.get('/', authMiddleware, listUsers);
router.get('/me', authMiddleware, getProfile);
router.put('/me', authMiddleware, validateRequest(userUpdateSchema), updateUser);

module.exports = router;

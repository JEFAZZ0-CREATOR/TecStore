const { registerUser, loginUser } = require('./auth.service');
const { asyncHandler } = require('../../shared/utils/asyncHandler');

exports.register = asyncHandler(async (req, res) => {
  const result = await registerUser(req.body);
  res.status(201).json({ success: true, message: 'User registered successfully', data: result });
});

exports.login = asyncHandler(async (req, res) => {
  const result = await loginUser(req.body);
  res.json({ success: true, message: 'Login successful', data: result });
});

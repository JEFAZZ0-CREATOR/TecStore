const { asyncHandler } = require('../../shared/utils/asyncHandler');
const userService = require('./user.service');

exports.getProfile = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.user.id);
  res.json({ success: true, data: user });
});

exports.listUsers = asyncHandler(async (req, res) => {
  const users = await userService.getAllUsers();
  res.json({ success: true, data: users });
});

exports.updateUser = asyncHandler(async (req, res) => {
  const updated = await userService.updateUser(req.user.id, req.body);
  res.json({ success: true, data: updated });
});

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

exports.uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  // Build a public URL for the uploaded file
  const host = req.get('host')
  const protocol = req.protocol
  const avatarPath = `/uploads/avatars/${req.file.filename}`

  const updated = await userService.updateUser(req.user.id, { avatarUrl: avatarPath });
  res.json({ success: true, data: updated });
});

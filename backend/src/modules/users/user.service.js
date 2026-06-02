const AppError = require('../../shared/utils/AppError');
const User = require('../auth/auth.model');

exports.getAllUsers = async () => {
  return (await User.find().select('-password')).map((user) => user.toJSON());
};

exports.getUserById = async (id) => {
  const user = await User.findById(id).select('-password');
  if (!user) throw new AppError('Usuario no encontrado', 404);
  return user.toJSON();
};

exports.updateUser = async (id, payload) => {
  const user = await User.findById(id);
  if (!user) throw new AppError('Usuario no encontrado', 404);
  if (payload.email) payload.email = payload.email.toLowerCase();
  Object.assign(user, payload);
  await user.save();
  return user.toJSON();
};

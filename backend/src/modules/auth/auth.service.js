const jwt = require('jsonwebtoken');
const AppError = require('../../shared/utils/AppError');
const User = require('./auth.model');
const { JWT_SECRET, JWT_EXPIRES_IN = '8h' } = require('../../config/index');
const { comparePassword } = require('../../shared/utils/helpers');

const signToken = (user) => jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

exports.registerUser = async ({ name, email, password }) => {
  if (!name || !email || !password) {
    throw new AppError('Nombre, email y contraseña son requeridos', 400);
  }
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw new AppError('El usuario ya existe', 409);
  }
  const user = await User.create({ name, email: email.toLowerCase(), password });
  const token = signToken(user);
  return { user: user.toJSON(), token };
};

exports.loginUser = async ({ email, password }) => {
  if (!email || !password) {
    throw new AppError('Email y contraseña son requeridos', 400);
  }
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || !comparePassword(password, user.password)) {
    throw new AppError('Email o contraseña incorrectos', 401);
  }
  const token = signToken(user);
  return { user: user.toJSON(), token };
};

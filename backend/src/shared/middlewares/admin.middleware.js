const AppError = require('../utils/AppError');

const ADMIN_EMAILS = [
  'luischv1979@gmail.com',
  'derek.vallejo.alp@cbtis258.edu.mx',
  'orlando.torres.alp@cbtis258.edu.mx',
  'juanaldair.ramos.alp@cbtis258.edu.mx',
];

module.exports = (req, res, next) => {
  if (!req.user) return next(new AppError('No autenticado', 401));
  const email = (req.user.email || '').toLowerCase();
  if (req.user.role === 'admin' || ADMIN_EMAILS.includes(email)) {
    return next();
  }
  return next(new AppError('Acceso denegado: se requiere rol de administrador', 403));
};

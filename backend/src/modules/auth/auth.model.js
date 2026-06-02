const mongoose = require('mongoose');
const { hashPassword } = require('../../shared/utils/helpers');

const authSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, default: 'customer', enum: ['admin', 'customer'] },
  createdAt: { type: Date, default: Date.now },
}, { versionKey: false });

authSchema.pre('save', function (next) {
  if (!this.isModified('password')) return next();
  this.password = hashPassword(this.password);
  next();
});

authSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.models.User || mongoose.model('User', authSchema);

const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, required: true, default: 1, min: 1 },
      price: { type: Number, required: true },
      title: { type: String, required: true },
      provider: { type: String, required: true },
    },
  ],
  updatedAt: { type: Date, default: Date.now },
}, { versionKey: false });

cartSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.models.Cart || mongoose.model('Cart', cartSchema);

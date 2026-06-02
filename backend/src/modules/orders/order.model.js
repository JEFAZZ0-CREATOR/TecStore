const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
      title: { type: String, required: true },
    },
  ],
  subtotal: { type: Number, required: true },
  tax: { type: Number, default: 0 },
  shipping: { type: Number, default: 0 },
  total: { type: Number, required: true },
  status: { type: String, default: 'pending', enum: ['pending', 'paid', 'shipped', 'cancelled'] },
  paymentStatus: { type: String, default: 'unpaid', enum: ['unpaid', 'processing', 'paid', 'failed'] },
  createdAt: { type: Date, default: Date.now },
}, { versionKey: false });

module.exports = mongoose.models.Order || mongoose.model('Order', orderSchema);

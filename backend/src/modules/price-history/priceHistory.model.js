const mongoose = require('mongoose');

const priceHistorySchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    identifier: { type: String, index: true },
    title: { type: String },
    provider: { type: String },
    price: { type: Number, required: true },
    recordedAt: { type: Date, default: Date.now, index: true },
  },
  { versionKey: false }
);

module.exports = mongoose.models.PriceHistory || mongoose.model('PriceHistory', priceHistorySchema);

const mongoose = require('mongoose');

const priceHistorySchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    price: { type: Number, required: true },
    recordedAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

module.exports = mongoose.models.PriceHistory || mongoose.model('PriceHistory', priceHistorySchema);

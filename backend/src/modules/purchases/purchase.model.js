const mongoose = require('mongoose');

const purchaseItemSchema = new mongoose.Schema(
  {
    identifier: { type: String, required: true },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    lineTotal: { type: Number, required: true },
    provider: { type: String, default: 'desconocido' },
    url: { type: String, default: '' },
    image: { type: String, default: '' },
  },
  { _id: false }
);

const purchaseSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    sessionId: { type: String, required: true, unique: true },
    items: { type: [purchaseItemSchema], required: true },
    subtotal: { type: Number, required: true },
    itemCount: { type: Number, required: true },
    providerCount: { type: Number, required: true },
    providers: [{ type: String }],
    openedUrls: [{ type: String }],
    source: { type: String, default: 'cart', enum: ['cart', 'single'] },
    purchasedAt: { type: Date, default: Date.now, index: true },
  },
  { versionKey: false }
);

purchaseSchema.index({ userId: 1, purchasedAt: -1 });

module.exports = mongoose.models.Purchase || mongoose.model('Purchase', purchaseSchema);

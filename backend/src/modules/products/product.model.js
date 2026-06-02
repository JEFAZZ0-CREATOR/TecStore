const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  provider: { type: String, required: true },
  image: { type: String },
  price: { type: Number, required: true },
  rating: { type: Number, min: 0, max: 5 },
  available: { type: Boolean, default: true },
  url: { type: String },
  category: { type: String },
  specs: { type: mongoose.Schema.Types.Mixed },
  externalId: { type: String },
}, { timestamps: true, versionKey: false });

// Índice de texto para búsqueda
productSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.models.Product || mongoose.model('Product', productSchema);

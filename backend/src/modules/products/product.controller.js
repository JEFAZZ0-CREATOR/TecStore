const { asyncHandler } = require('../../shared/utils/asyncHandler');
const productService = require('./product.service');

exports.listProducts = asyncHandler(async (req, res) => {
  const products = await productService.getProducts(req.query);
  res.json({ success: true, data: products });
});

exports.getProduct = asyncHandler(async (req, res) => {
  const product = await productService.getProductById(req.params.id);
  res.json({ success: true, data: product });
});

exports.createProduct = asyncHandler(async (req, res) => {
  const product = await productService.createProduct(req.body);
  res.status(201).json({ success: true, data: product });
});

exports.updateProduct = asyncHandler(async (req, res) => {
  const product = await productService.updateProduct(req.params.id, req.body);
  res.json({ success: true, data: product });
});

exports.deleteProduct = asyncHandler(async (req, res) => {
  const product = await productService.deleteProduct(req.params.id);
  res.json({ success: true, data: product });
});

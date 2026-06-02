const express = require('express');
const { getAllCategories } = require('./category.service');
const { asyncHandler } = require('../../shared/utils/asyncHandler');
const router = express.Router();

router.get('/', asyncHandler(async (req, res) => {
  const data = await getAllCategories();
  res.json({ success: true, data });
}));

module.exports = router;

const Category = require('./category.model');

exports.getAllCategories = async () => Category.find().sort({ name: 1 }).lean();

const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    categoryName: String,
    categoryImageUrl: String,
  },
  { timestamps: true }
);

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;

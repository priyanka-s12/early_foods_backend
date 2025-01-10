const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    categoryName: String,
    categoryImageUrl: String,
    checked: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    productTitle: String,
    description: String,
    rating: Number,
    numberOfReviews: Number,
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    originalPrice: Number,
    sellingPrice: Number,
    ingredients: String,
    netWeight: Number,
    imageUrl: String,
  },
  { timestamps: true }
);

const Product = mongoose.model('Product', productSchema);

module.exports = Product;

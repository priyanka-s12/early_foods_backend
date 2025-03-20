const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    cartItem: { type: mongoose.Schema.Types.ObjectId, ref: 'Cart' },
    orderDate: {
      type: Date,
      default: Date.now,
    },
    shippingAddress: { type: mongoose.Schema.Types.ObjectId, ref: 'Address' },
  },
  { timestamps: true }
);

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;

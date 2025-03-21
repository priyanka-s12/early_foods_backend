const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema(
  {
    firstName: String,
    lastName: String,
    mobileNumber: Number,
    addressLine1: String,
    addressLine2: String,
    landmark: String,
    city: String,
    pincode: Number,
    state: String,
    country: String,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

const Address = mongoose.model('Address', addressSchema);
module.exports = Address;

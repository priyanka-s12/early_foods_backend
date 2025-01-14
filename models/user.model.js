const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    firstName: String,
    lastName: String,
    email: String,
    password: String,
    address: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Address' }],
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

module.exports = User;

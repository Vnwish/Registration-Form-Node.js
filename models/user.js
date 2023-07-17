const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  resetToken: { type: String }, // New field for password reset token
  resetTokenExpiry: { type: Date }, // New field for password reset token expiry
});

module.exports = mongoose.model('User', userSchema);

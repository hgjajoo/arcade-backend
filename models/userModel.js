const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  fullname: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
});

// Pre-save hook to hash the password
userSchema.pre('save', async function (next) {
  // Hash the password only if it’s new or modified
  if (!this.isModified('password')) return next();
  
  // Hash the password with bcrypt
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Create and export the User model
const User = mongoose.model('User', userSchema);
module.exports = User;


// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');

// const userSchema = new mongoose.Schema({
//   fullname: { type: String, required: true },
//   email: { type: String, unique: true, required: true },
//   password: { type: String, required: true },
//   regNo: { type: String, unique: true, required: true },
//   balance: { type: Number, default: 0 },
// });



// const User = mongoose.model('User', userSchema);
// module.exports = User;

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullname: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true }, // Store plain text password
  regNo: { type: String, unique: true, required: true },
  balance: { type: Number, default: 0 },
});

// Adding a method to directly compare passwords
userSchema.methods.comparePassword = function(candidatePassword) {
  return candidatePassword === this.password;
};

const User = mongoose.model('User', userSchema);
module.exports = User;

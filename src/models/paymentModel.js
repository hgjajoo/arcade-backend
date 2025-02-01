const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  regNo: { type: String, required: true },
  gameNo: { type: String, required: true },
  paymentAmount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
});

const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment;

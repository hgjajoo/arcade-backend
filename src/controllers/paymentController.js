// const Payment = require("../models/paymentModel");
// const User = require("../models/userModel");

// exports.getPaymentHistory = async (req, res) => {
//   try {
//     const { regNo } = req.params;
//     const payments = await Payment.find({ regNo });
//     const user = await User.findOne({ regNo });

//     if (!user) return res.status(404).json({ status: "fail", message: "User not found" });

//     res.status(200).json({
//       status: "success",
//       data: {
//         payments,
//         balance: user.balance,
//       },
//     });
//   } catch (err) {
//     res.status(500).json({ status: "fail", message: err.message });
//   }
// };
const Payment = require("../models/paymentModel");
const User = require("../models/userModel");

// Get payment history
exports.getPaymentHistory = async (req, res) => {
  try {
    const { regNo } = req.params;
    const payments = await Payment.find({ regNo });
    const user = await User.findOne({ regNo });

    if (!user) return res.status(404).json({ status: "fail", message: "User not found" });

    res.status(200).json({
      status: "success",
      data: {
        payments,
        balance: user.balance,
      },
    });
  } catch (err) {
    res.status(500).json({ status: "fail", message: err.message });
  }
};

// Add money to user's balance
exports.addMoney = async (req, res) => {
  try {
    const { regNo, amount } = req.body;

    // Find the user
    const user = await User.findOne({ regNo });
    if (!user) return res.status(404).json({ status: "fail", message: "User not found" });

    // Update the user's balance
    user.balance += amount;
    await user.save();

    // Create a payment record
    const payment = await Payment.create({
      regNo,
      gameNo: "ADD_MONEY",
      paymentAmount: amount,
    });

    res.status(200).json({
      status: "success",
      data: {
        user: {
          fullname: user.fullname,
          email: user.email,
          regNo: user.regNo,
          balance: user.balance,
        },
        payment,
      },
    });
  } catch (err) {
    res.status(500).json({ status: "fail", message: err.message });
}
};
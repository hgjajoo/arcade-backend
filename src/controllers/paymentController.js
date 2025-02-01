const Payment = require("../models/paymentModel");
const User = require("../models/userModel");

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

const Payment = require("../models/paymentModel");
const User = require("../models/userModel");

// Get payment history
exports.getPaymentHistory = async (req, res) => {
    try {
        const { regNo } = req.params;
        const payments = await Payment.find({ regNo });
        const user = await User.findOne({ regNo });

        if (!user) {
            return res.status(404).json({ 
                status: "fail", 
                message: "User not found" 
            });
        }

        res.status(200).json({
            status: "success",
            data: {
                payments,
                balance: user.balance
            }
        });
    } catch (err) {
        res.status(500).json({ 
            status: "fail", 
            message: err.message 
        });
    }
};

// Add money to user's balance
exports.addMoney = async (req, res) => {
    try {
        const { regNo, amount } = req.body;
        
        if (!regNo || !amount || amount <= 0) {
            return res.status(400).json({ 
                status: "fail", 
                message: "Invalid input data" 
            });
        }

        const user = await User.findOne({ regNo });
        if (!user) {
            return res.status(404).json({ 
                status: "fail", 
                message: "User not found" 
            });
        }

        user.balance += amount;
        await user.save();

        const payment = await Payment.create({
            regNo,
            gameNo: "ADD_MONEY",
            paymentAmount: amount
        });

        res.status(200).json({
            status: "success",
            data: {
                user: {
                    fullname: user.fullname,
                    email: user.email,
                    regNo: user.regNo,
                    balance: user.balance
                },
                payment
            }
        });
    } catch (err) {
        res.status(500).json({ 
            status: "fail", 
            message: err.message 
        });
    }
};

// Spend money
exports.spendMoney = async (req, res) => {
    try {
        const { regNo, amount, stallName } = req.body;

        if (!regNo || !amount || amount <= 0 || !stallName) {
            return res.status(400).json({ 
                status: "fail", 
                message: "Please provide valid regNo, amount, and stallName" 
            });
        }

        const user = await User.findOne({ regNo });
        if (!user) {
            return res.status(404).json({ 
                status: "fail", 
                message: "User not found" 
            });
        }

        if (user.balance < amount) {
            return res.status(400).json({ 
                status: "fail", 
                message: "Insufficient balance" 
            });
        }

        user.balance -= amount;
        await user.save();

        const payment = await Payment.create({
            regNo,
            gameNo: stallName,
            paymentAmount: -amount
        });

        res.status(200).json({
            status: "success",
            message: `₹${amount} spent at ${stallName}`,
            data: {
                user: {
                    fullname: user.fullname,
                    email: user.email,
                    regNo: user.regNo,
                    balance: user.balance
                },
                payment
            }
        });
    } catch (err) {
        res.status(500).json({ 
            status: "fail", 
            message: err.message 
        });
    }
};
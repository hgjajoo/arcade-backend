const Payment = require("../models/paymentModel");
const User = require("../models/userModel");

// Get payment history
exports.getPaymentHistory = async (req, res) => {
    try {
        console.log("Received request for payment history.");

        // Ensure user is attached from middleware
        if (!req.user) {
            console.error("Unauthorized access attempt - No user in request.");
            return res.status(401).json({ 
                status: "fail", 
                message: "Unauthorized: User not found" 
            });
        }

        const regNo = req.user.regNo; // Extract regNo from middleware
        console.log(`Fetching payment history for regNo: ${regNo}`);

        // Fetch payments
        const payments = await Payment.find({ regNo });
        console.log("Payments fetched:", payments);

        // Fetch user details
        const user = await User.findOne({ regNo });
        console.log("User fetched:", user);

        if (!user) {
            console.error(`User with regNo ${regNo} not found.`);
            return res.status(404).json({ 
                status: "fail", 
                message: "User not found" 
            });
        }

        console.log(`Returning payment history for user ${user.fullname} with balance: ₹${user.balance}`);

        res.status(200).json({
            status: "success",
            data: {
                payments,
                balance: user.balance
            }
        });
    } catch (err) {
        console.error("Error fetching payment history:", err);
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
            stall: "None",
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
        const { stallNo } = req.body;

        if (!req.user) {
            return res.status(401).json({ 
                status: "fail", 
                message: "Unauthorized: User not found" 
            });
        }

        const user = req.user;

        // Determine deduction amount and set the stall name based on stallNo
        let amount = 0;
        let stallName = '';
        
        if (stallNo == 1) {
            amount = 50;
            stallName = 'Fun Game 1';
        } else if (stallNo == 2) {
            amount = 60;
            stallName = 'Fun Game 2';
        } else if (stallNo == 3) {
            amount = 75;
            stallName = 'Fun Game 3';
        } else {
            return res.status(400).json({ 
                status: "fail", 
                message: "Invalid stallNo" 
            });
        }

        // Check balance
        if (user.balance < amount) {
            return res.status(400).json({ 
                status: "fail", 
                message: "Insufficient balance" 
            });
        }

        // Deduct balance
        user.balance -= amount;
        await user.save();

        // Store transaction in Payment model
        const payment = await Payment.create({
            regNo: user.regNo, 
            stall: stallName,
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

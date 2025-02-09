const express = require("express");
const authController = require("../controllers/authController");
const paymentController = require("../controllers/paymentController");
const router = express.Router();

// First, let's verify what we're importing
console.log("Payment Controller methods:", {
    getPaymentHistory: !!paymentController.getPaymentHistory,
    addMoney: !!paymentController.addMoney,
    spendMoney: !!paymentController.spendMoney
});

// Authentication routes
router.post("/login", authController.login);

// Payment routes
// Only add routes if the controller methods exist
if (paymentController.getPaymentHistory) {
    router.get("/payment-history/:regNo", paymentController.getPaymentHistory);
}

if (paymentController.addMoney) {
    router.post("/add-money", paymentController.addMoney);
}

if (paymentController.spendMoney) {
    router.post("/spend-money", paymentController.spendMoney);
}

module.exports = router;
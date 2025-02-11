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

// Registration routes
router.post("/createUser", authController.createUser);

// Payment routes
router.get("/payment-history/:regNo", paymentController.getPaymentHistory);

router.post("/add-money", paymentController.addMoney);

router.post("/spend-money", paymentController.spendMoney);


module.exports = router;
const express = require("express");
const authController = require("../controllers/authController");
const paymentController = require("../controllers/paymentController");
const { protect } = require("../middleware/jwt");

const router = express.Router();

// Authentication routes
router.post("/login", authController.login);
router.post("/createUser", authController.createUser);

// Protected profile route
router.get("/profile", protect, authController.getProfile);

// Payment routes
router.get("/payment-history/", protect,  paymentController.getPaymentHistory);
router.post("/add-money", paymentController.addMoney);
router.post("/spendMoney", protect, paymentController.spendMoney);

module.exports = router;

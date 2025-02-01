const express = require("express");
const authController = require("../controllers/authController");
const paymentController = require("../controllers/paymentController");
const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.get("/payment-history/:regNo", paymentController.getPaymentHistory);

module.exports = router;
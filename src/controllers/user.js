const express = require("express");
const authController = require("../controllers/authController");
const paymentController = require("../controllers/paymentController");

const router = express.Router();

// Debugging: Log available functions
console.log("Loaded paymentController:", Object.keys(paymentController));

// Ensure functions exist before adding routes
if (paymentController.spendMoney) {
  router.post("/spend-money", paymentController.spendMoney);
} else {
  console.error("⚠️ Error: spendMoney is undefined in paymentController");
}

if (paymentController.getPaymentHistory) {
  router.get("/payment-history/:regNo", paymentController.getPaymentHistory);
} else {
  console.error("⚠️ Error: getPaymentHistory is undefined in paymentController");
}

if (paymentController.addMoney) {
  router.post("/add-money", paymentController.addMoney);
} else {
  console.error("⚠️ Error: addMoney is undefined in paymentController");
}

// Login route
router.post("/login", authController.login);

module.exports = router;

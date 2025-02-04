// const express = require("express");
// const authController = require("../controllers/authController");
// const paymentController = require("../controllers/paymentController");
// const router = express.Router();

// router.post("/signup", authController.signup);
// router.post("/login", authController.login);
// router.get("/payment-history/:regNo", paymentController.getPaymentHistory);

// module.exports = router;
const express = require("express");
const authController = require("../controllers/authController");
const paymentController = require("../controllers/paymentController");
const router = express.Router();

// Login route
router.post("/login", authController.login);

// Payment history route
router.get("/payment-history/:regNo", paymentController.getPaymentHistory);

// Add money route
router.post("/add-money", paymentController.addMoney);

module.exports = router;
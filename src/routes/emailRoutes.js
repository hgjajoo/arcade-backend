// src/routes/emailRoutes.js
const express = require("express");
const emailController = require("../controllers/emailController");
const router = express.Router();

// New route to manually trigger bulk email sending
router.post("/send-bulk-emails", emailController.bulkSendEmails);

module.exports = router;
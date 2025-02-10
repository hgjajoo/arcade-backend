// module.exports = router;
const express = require("express");
const emailController = require("../controllers/emailController");
const router = express.Router();

// Use the upload middleware from the controller
router.post("/send-bulk-emails-file", 
    emailController.upload.single("file"), 
    emailController.bulkSendEmailsWithFile
);

module.exports = router;
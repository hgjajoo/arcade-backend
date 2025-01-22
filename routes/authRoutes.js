

const express = require("express");
const authController = require("../controllers/authController");

const router = express.Router();

// Route for signing up a new user
router.post("/signup", authController.signup);

// Route for fetching all users
router.get("/", authController.getAllUsers);

module.exports = router;


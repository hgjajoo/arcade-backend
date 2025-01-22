const User = require("../models/userModel");

// Signup functionality (existing)
exports.signup = async (req, res) => {
  try {
    const { fullname, email, password } = req.body;

    // Create new user
    const user = await User.create({
      fullname,
      email,
      password,
    });

    res.status(201).json({
      status: "success",
      data: { user },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

// Get all users (new functionality)
exports.getAllUsers = async (req, res) => {
  try {
    // Fetch all users from the database
    const users = await User.find(); // No filters applied, retrieves all users

    res.status(200).json({
      status: "success",
      results: users.length,
      data: { users },
    });
  } catch (err) {
    res.status(500).json({
      status: "fail",
      message: err.message,
    });
  }
};

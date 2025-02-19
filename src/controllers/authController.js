const User = require("../models/userModel");
const { generateToken } = require("../middleware/jwt");
const bcrypt = require("bcryptjs");

// Function to hash passwords
const hashPassword = async (password) => {
  return await bcrypt.hash(password, 12);
};

// Function to get user profile 
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: user,
    });
  } catch (err) {
    console.error("Profile Fetch Error:", err);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

// Login function
exports.login = async (req, res) => {
  try {
    console.log("Login Request Body:", req.body);
    const { regNo, password } = req.body;

    if (!regNo || !password) {
      return res.status(400).json({ status: "fail", message: "RegNo and password are required" });
    }

    // Find user by regNo
    const user = await User.findOne({ regNo });

    if (!user) {
      return res.status(401).json({ status: "fail", message: "Invalid regNo or password" });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password match result:", isMatch);

    if (!isMatch) {
      return res.status(401).json({ status: "fail", message: "Invalid regNo or password" });
    }

    // Generate token
    const token = generateToken({ id: user._id, regNo: user.regNo });

    res.status(200).json({
      status: "success",
      data: {
        user: {
          fullname: user.fullname,
          regNo: user.regNo,
          balance: user.balance,
        },
        token,
      },
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
};

// Create user function
exports.createUser = async (req, res) => {
  try {
    const { fullname, regNo, password } = req.body;

    // Check if regNo exists
    const existingUser = await User.findOne({ regNo });
    if (existingUser) {
      return res.status(400).json({ status: "fail", message: "RegNo already exists" });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create new user
    const newUser = new User({
      fullname,
      regNo,
      password: hashedPassword,
    });

    // Save to database
    await newUser.save();

    // Generate token
    const token = generateToken({ id: newUser._id, regNo: newUser.regNo });

    // Send response
    res.status(201).json({
      status: "success",
      data: {
        user: {
          fullname: newUser.fullname,
          regNo: newUser.regNo,
          balance: newUser.balance,
        },
        token,
      },
    });
  } catch (err) {
    console.error("Registration Error:", err);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
};

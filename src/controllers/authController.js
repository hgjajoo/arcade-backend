// // const User = require("../models/userModel");
// // const { generateToken } = require("../utils/jwt");

// // exports.login = async (req, res) => {
// //   try {
// //     console.log('Login Request Body:', req.body);
    
// //     const { email, password } = req.body;
    
// //     // Find user by email
// //     const user = await User.findOne({ email });
    
// //     console.log('Found User:', user);
    
// //     // Check if user exists
// //     if (!user) {
// //       return res.status(404).json({ 
// //         status: "fail", 
// //         message: "User not found" 
// //       });
// //     }
    
// //     // Compare passwords
// //     const isMatch = await user.comparePassword(password);
    
// //     // Check if password matches
// //     if (!isMatch) {
// //       return res.status(401).json({ 
// //         status: "fail", 
// //         message: "Invalid credentials" 
// //       });
// //     }
    
// //     // Generate token
// //     const token = generateToken({ 
// //       id: user._id, 
// //       email: user.email 
// //     });

// //     // Successful login
// //     res.status(200).json({
// //       status: "success",
// //       data: {
// //         user: {
// //           fullname: user.fullname,
// //           email: user.email,
// //           regNo: user.regNo,
// //           balance: user.balance,
// //         },
// //         token,
// //       },
// //     });
// //   } catch (err) {
// //     console.error('Login Error:', err);
// //     res.status(500).json({ 
// //       status: "fail", 
// //       message: "Internal server error" 
// //     });
// //   }
// // };
const User = require("../models/userModel");
const { generateToken } = require("../utils/jwt");
const bcrypt = require("bcryptjs");

exports.login = async (req, res) => {
  try {
    console.log('Login Request Body:', req.body);
    
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        status: "fail",
        message: "Please provide email and password"
      });
    }

    // Find user by email and explicitly select the password field
    const user = await User.findOne({ email }).select('+password');
    
    console.log('Found User:', user);
    
    // Check if user exists
    if (!user) {
      return res.status(401).json({ 
        status: "fail", 
        message: "Invalid email or password" 
      });
    }
    
    // Compare passwords
    let isMatch;
    try {
      isMatch = await bcrypt.compare(password, user.password);
    } catch (error) {
      console.error('Password comparison error:', error);
      return res.status(500).json({
        status: "error",
        message: "Error verifying credentials"
      });
    }
    
    // Check if password matches
    if (!isMatch) {
      return res.status(401).json({ 
        status: "fail", 
        message: "Invalid email or password" 
      });
    }
    
    // Generate token
    const token = generateToken({ 
      id: user._id, 
      email: user.email 
    });

    // Remove password from response
    const userResponse = {
      fullname: user.fullname,
      email: user.email,
      regNo: user.regNo,
      balance: user.balance,
    };

    // Successful login
    res.status(200).json({
      status: "success",
      data: {
        user: userResponse,
        token,
      },
    });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ 
      status: "error", 
      message: "Internal server error" 
    });
  }
};

// Add a helper function to hash passwords
exports.hashPassword = async (password) => {
  return await bcrypt.hash(password, 12);
};


const User = require("../models/userModel");
const { generateToken } = require("../utils/jwt");
const bcrypt = require("bcryptjs");
const {verifyHashedData} = require("../utils/hashData");

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
    const user = await User.findOne({ email });
    
    console.log('Found User:', user);
    
    // Check if user exists
    if (!user) {
      return res.status(401).json({ 
        status: "fail", 
        message: "Invalid email or password" 
      });
    }
    
    // Use the comparePassword method from the User model
    const isMatch = await verifyHashedData(password, user.password);
    
    // Add this console.log to debug the password comparison
    console.log('Password match result:', isMatch);
    
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

// Create user 
exports.createUser = async (req, res) => {
  try {
    const { fullname, email, regNo, password } = req.body;
    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: "fail",
        message: "Email already exists",
      });
    }
    // Hash the password
    const hashedPassword = await this.hashPassword(password);
    // Create a new user
    const newUser = new User({
      fullname,
      email,
      regNo,
      password: hashedPassword,
    });
    // Save the user to the database
    await newUser.save();
    // Generate token
    const token = generateToken({
      id: newUser._id,
      email: newUser.email
    });
    // Remove password from response
    const userResponse = {
      fullname: newUser.fullname,
      email: newUser.email,
      regNo: newUser.regNo,
      balance: newUser.balance,
    };
    // Successful registration
    res.status(201).json({
      status: "success",
      data: {
        user: userResponse,
        token,
      },
    });
  } catch (err) {
    console.error('Registration Error:', err);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

// Add a helper function to hash passwords
exports.hashPassword = async (password) => {
  return await bcrypt.hash(password, 12);
};


const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
require("dotenv").config(); // Load environment variables

const protect = async (req, res, next) => {
  try {
    console.log("Incoming request headers:", req.headers); // Debug request headers

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized, token missing" });
    }

    console.log("Authorization Header:", authHeader); // Log entire header

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Unauthorized, empty token" });
    }

    console.log("Extracted Token:", token); // Log token value

    // Ensure JWT_SECRET exists
    const secret = process.env.JWT_SECRET;
    console.log("JWT_SECRET from env:", secret ? "Loaded successfully" : "MISSING"); // Don't log actual secret for security

    if (!secret) {
      console.error("Error: JWT_SECRET is not set in environment variables.");
      return res.status(500).json({ error: "Server configuration error" });
    }

    // Verify token
    const decoded = jwt.verify(token, secret);
    console.log("Decoded Token:", decoded); // Log decoded JWT payload

    // Find user in DB
    const user = await User.findById(decoded.id).select("-password");
    console.log("User found:", user ? user.email : "User not found"); // Log user details

    if (!user) {
      return res.status(401).json({ error: "User not found, access denied" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("JWT Verification Error:", err);

    let errorMessage = "Invalid or expired token";
    if (err.name === "TokenExpiredError") errorMessage = "Token expired";
    if (err.name === "JsonWebTokenError") errorMessage = "Invalid token";

    return res.status(401).json({ error: errorMessage });
  }
};


// Generate JWT token
const generateToken = (userData) => {
  const secret = process.env.JWT_SECRET;
  
  console.log("Generating token with secret:", secret ? "Loaded successfully" : "MISSING"); // Debug secret existence

  if (!secret) {
    console.error("Error: JWT_SECRET is not set in environment variables.");
    throw new Error("JWT secret missing");
  }

  const token = jwt.sign(userData, secret, { expiresIn: "7d" });
  console.log("Generated Token:", token); // Log generated token (useful for debugging)

  return token;
};


module.exports = { protect, generateToken };

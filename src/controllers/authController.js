// const User = require("../models/userModel");
// const { generateToken } = require("../utils/jwt");


// exports.signup = async (req, res) => {
//   try {
//     const { fullname, email, password, regNo } = req.body;
//     const user = await User.create({ fullname, email, password, regNo });
//     const token = generateToken({ id: user._id, email: user.email });
//     res.status(201).json({ status: "success", data: { user, token } });
//   } catch (err) {
//     res.status(400).json({ status: "fail", message: err.message });
//   }
// };

// exports.login = async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const user = await User.findOne({ email });
//     if (!user) return res.status(404).json({ status: "fail", message: "User not found" });
//     const isMatch = await user.comparePassword(password);
//     if (!isMatch) return res.status(401).json({ status: "fail", message: "Invalid credentials" });
//     const token = generateToken({ id: user._id, email: user.email });

//     res.status(200).json({
//       status: "success",
//       data: {
//         user: {
//           fullname: user.fullname,
//           email: user.email,
//           regNo: user.regNo,
//           balance: user.balance,
//         },
//         token,
//       },
//     });
//   } catch (err) {
//     res.status(500).json({ status: "fail", message: err.message });
//   }
// };
const User = require("../models/userModel");
const { generateToken } = require("../utils/jwt");

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ status: "fail", message: "User not found" });
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ status: "fail", message: "Invalid credentials" });
    const token = generateToken({ id: user._id, email: user.email });

    res.status(200).json({
      status: "success",
      data: {
        user: {
          fullname: user.fullname,
          email: user.email,
          regNo: user.regNo,
          balance: user.balance,
        },
        token,
      },
    });
  } catch (err) {
    res.status(500).json({ status: "fail", message: err.message });
  }
};
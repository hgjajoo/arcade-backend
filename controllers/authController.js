const User = require("../models/userModel");

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

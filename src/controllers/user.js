const user = require('../models/userModel')

async function handleUserSignup(req, res) {
  const{fullname, email, password} = req.body;
  await user.create({
    fullname,
    email,
    password,
  });
  return res.json;
}

async function handleUserLogin(req, res) {
  const{email, password} = req.body;
  const user = await user.findOne({ email, password});
  if (!user) return res.status(404).json({ message: 'User not found' });
  return res.json;
}


module.exports = {
  handleUserSignup,
  handleUserLogin
};
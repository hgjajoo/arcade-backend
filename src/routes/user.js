// const express = require( 'express');
// const router = express.Router();
// const Person = require('../models/userModel');
// //POST route to add a person 
// router.post('/signup', async (req, res) =>{
//    try{
//         const data = req. body // Assuming the request body contains the person data
//         // Create a new Person document using the Mongoose model
//         const newPerson = new Person(data) ;
//         // Save the new person to the database
//         const response = await newPerson.save();
//         console.log ('data saved');
//         res.status(200).json(response);
//    }catch(err){
//         console.log(err);
//         res.status(500).json({error: 'Internal Server Error'});
//    }

// });
const user = require('../models/userModel');

// Handle user login
async function handleUserLogin(req, res) {
  const { email, password } = req.body;
  const user = await user.findOne({ email, password });
  if (!user) return res.status(404).json({ message: 'User not found' });
  return res.json({ message: 'Login successful', user });
}

module.exports = {
  handleUserLogin
};
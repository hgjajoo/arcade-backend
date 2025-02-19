require('dotenv').config(); // Load environment variables from .env
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Payment = require('./src/models/paymentModel'); // Path to your payment model
const User = require('./src/models/userModel'); // Path to your user model

const MONGO_URI = process.env.MONGO_URI; // Mongo URI from .env

// Connect to MongoDB
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// Helper function to hash passwords
const hashPassword = async (password) => {
  return await bcrypt.hash(password, 12);
};

// Function to generate random user data and insert it into the database
const seedDatabase = async () => {
  try {
    // Clear all previous users and payments
    await User.deleteMany({});
    await Payment.deleteMany({});
    console.log('Old users and payments removed.');

    // Create users
    const users = [
      {
        fullname: 'Emily Davis',
        email: 'emily.davis@example.com',
        password: 'password202',
        regNo: 'E998877665',
        balance: 500.99,
      },
      {
        fullname: 'Mary Johnson',
        email: 'mary.johnson@example.com',
        password: 'password789',
        regNo: 'C112233445',
        balance: 350.00,
      },
    ];

    // Hash passwords and insert the users
    const hashedUsers = await Promise.all(users.map(async user => ({
      ...user,
      password: await hashPassword(user.password),
    })));
    
    await User.insertMany(hashedUsers);
    console.log('Selected users added to the database successfully.');

    // Create and insert payments directly using their regNo
    const payments = [
      // Payments for Emily Davis (regNo: E998877665)
      { regNo: 'E998877665', stall: 'Stall 1', paymentAmount: 150.50, date: new Date('2025-02-01') },
      { regNo: 'E998877665', stall: 'Stall 2', paymentAmount: 200.75, date: new Date('2025-02-10') },
      { regNo: 'E998877665', stall: 'Stall 3', paymentAmount: 75.99, date: new Date('2025-02-12') },

      // Payments for Mary Johnson (regNo: C112233445)
      { regNo: 'C112233445', stall: 'Stall 2', paymentAmount: 300.00, date: new Date('2025-02-05') },
      { regNo: 'C112233445', stall: 'Stall 4', paymentAmount: 50.00, date: new Date('2025-02-08') },
      { regNo: 'C112233445', stall: 'Stall 1', paymentAmount: 400.00, date: new Date('2025-02-14') },
    ];

    // Insert payments into the database
    await Payment.insertMany(payments);
    console.log('Payments added to the database successfully.');

    mongoose.connection.close(); // Close the connection after the operation
  } catch (err) {
    console.log('Error seeding database and payments:', err);
    mongoose.connection.close(); // Close the connection in case of error
  }
};

// Run the seeding function
seedDatabase();

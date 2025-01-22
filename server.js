// const express = require("express");
// const mongoose = require("mongoose");
// const dotenv = require("dotenv");

// // Routes
// const authRoutes = require("./routes/authRoutes");

// // Configure app
// dotenv.config();
// const app = express();
// app.use(express.json());

// // Routes
// app.use("/api/v1/auth", authRoutes);

// // Database connection
// mongoose
// mongoose
//   .connect(process.env.MONGO_URI)
//   .then(() => console.log("Connected to MongoDB"))
//   .catch(err => console.error("Database connection error:", err));


// // Start server
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));






// const express = require("express");
// const mongoose = require("mongoose");

// const app = express();

// // Middleware for parsing JSON requests
// app.use(express.json());

// // MongoDB Connection String
// const mongoURI = "mongodb+srv://ramit:gUAH7LmWWVwesXrB@cluster0.zcnop.mongodb.net/arcadeDB?retryWrites=true&w=majority";

// // Connect to MongoDB
// mongoose
//   // .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
//   // .then(() => console.log("Connected to MongoDB"))
//   // .catch((err) => {
//   //   console.error("Failed to connect to MongoDB:", err);
//   //   process.exit(1); // Exit if the database connection fails
//   // });
//   mongoose
//   .connect(mongoURI)
//   .then(() => console.log("Connected to MongoDB"))
//   .catch((err) => {
//     console.error("Failed to connect to MongoDB:", err);
//     process.exit(1); // Exit if the database connection fails
//   });


// // Routes
// app.post("/api/v1/user/signup", (req, res) => {
//   const { fullname, email, password } = req.body;
  
//   if (!fullname || !email || !password) {
//     return res.status(400).send("All fields are required");
//   }

//   // Here, you would add code to save the user to the database
//   console.log("User created:", { fullname, email });
//   res.status(201).send("User created successfully");
// });

// // Error Handling Middleware
// app.use((req, res) => {
//   res.status(404).send("Route not found");
// });

// // Server Setup
// const PORT = 5000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });


// const express = require("express");
// const mongoose = require("mongoose");
// const authRoutes = require("./routes/authRoutes"); // Correct file path

// require("dotenv").config();

// const app = express();
// app.use(express.json());

// // Routes Middleware
// app.use("/api/v1/users", authRoutes);

// // MongoDB Connection
// mongoose
//   .connect(process.env.MONGO_URI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => {
//     console.log("Connected to MongoDB");
//     app.listen(5000, () => {
//       console.log("Server running on port 5000");
//     });
//   })
//   .catch((err) => {
//     console.error("Database connection error:", err);
//   });

const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes'); // Auth Routes

// Load environment variables from .env file
dotenv.config();

// Initialize express app
const app = express();

// Middleware to parse JSON requests
app.use(express.json());

// MongoDB Connection
const connectDB = async () => {
  try {
    // Connect to MongoDB using the URI in the .env file
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1); // Stop the application if unable to connect to MongoDB
  }
};

// Route Middleware
app.use('/api/v1/users', authRoutes); // Routes for user authentication

// Basic test route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  await connectDB(); // Connect to MongoDB before handling requests
});


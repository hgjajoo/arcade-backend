const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const userRoutes = require("./src/routes/userRoutes");
const { generatePassword, encryptPassword } = require('./src/utils/passwords');


dotenv.config();

const app = express();
app.use(express.json());

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
};

app.use("/api/v1/user", userRoutes);

app.listen(process.env.PORT || 9000, async () => {
  console.log("Server running");
  await connectDB();
});

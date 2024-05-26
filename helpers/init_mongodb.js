const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected Database");
  } catch (err) {
    console.log("Connection Failed:", err.message);
  }
};

// Connection events
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to db');
});

mongoose.connection.on('error', (err) => {
  console.log('Mongoose connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose connection is disconnected');
});

// Handle SIGINT for graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('Mongoose connection is disconnected due to app termination');
  process.exit(0);
});

module.exports = connectDB;

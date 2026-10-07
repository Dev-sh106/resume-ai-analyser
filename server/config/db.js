// Connects to MongoDB. Called once when the server starts.
const mongoose = require("mongoose");

async function connectDB() {
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/resumetester";
  try {
    await mongoose.connect(uri);
    console.log(`[MongoDB] Connected: ${mongoose.connection.host}/${mongoose.connection.name}`);
  } catch (err) {
    // If MongoDB is not running the app still works, just without saving history.
    console.warn("[MongoDB] Could not connect:", err.message);
  }
}

module.exports = connectDB;

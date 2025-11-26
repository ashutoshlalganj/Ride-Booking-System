// db/db.js
import mongoose from "mongoose";

async function connectToDb() {
  const uri = process.env.DB_CONNECT;

  if (!uri) {
    console.error("❌ DB_CONNECT is not defined in .env");
    process.exit(1);
  }

  try {
    await mongoose.connect(uri, {
      // thoda clear error ke liye
      serverSelectionTimeoutMS: 10000,
    });
    console.log("✅ Connected to MongoDB Atlas");
  } catch (err) {
    console.error("❌ DB connection error:", err);
    // DB nahi to server chalane ka koi faayda nahi
    process.exit(1);
  }
}

export default connectToDb;

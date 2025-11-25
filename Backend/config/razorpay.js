// Backend/config/razorpay.js
import dotenv from "dotenv";
dotenv.config(); // ✅ .env yahin par load ho jayega

import Razorpay from "razorpay";

console.log("Razorpay ENV check:", {
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET ? "loaded" : "missing",
});

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export default razorpayInstance;

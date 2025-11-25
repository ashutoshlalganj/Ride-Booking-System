// Backend/models/payment.model.js
import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    ride: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ride",
      required: true,
    },
    amount: {
      type: Number, // in paise
      required: true,
    },
    currency: {
      type: String,
      default: "INR",
    },
    status: {
      type: String,
      enum: ["created", "paid", "failed"],
      default: "created",
    },
    method: {
      type: String, // Cash / UPI / Card
    },
    razorpay_order_id: String,
    razorpay_payment_id: String,
    razorpay_signature: String,
  },
  { timestamps: true }
);

const paymentModel = mongoose.model("payment", paymentSchema);
export default paymentModel;

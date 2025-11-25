// Backend/controllers/payment.controller.js

import crypto from "crypto";
import razorpayInstance from "../config/razorpay.js";
import paymentModel from "../models/payment.model.js";
import rideModel from "../models/ride.model.js";

// 1️⃣ CREATE ORDER CONTROLLER
export const createOrder = async (req, res) => {
  try {
    const { rideId } = req.body;
    const userId = req.user._id; // authUser middleware se aa raha hai

    // rideId required
    if (!rideId) {
      return res
        .status(400)
        .json({ success: false, message: "rideId is required" });
    }

    // ride fetch karo
    const ride = await rideModel.findById(rideId);
    if (!ride) {
      return res
        .status(404)
        .json({ success: false, message: "Ride not found" });
    }

    // fare ko paise me convert karo
    const amountInPaise = Math.round((ride.fare || 0) * 100);

    if (!amountInPaise || amountInPaise <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid ride fare for payment",
      });
    }

    // ⚠️ receipt ko chhota rakho (< 40 chars)
    const receiptId = `rcpt_${Date.now().toString().slice(-10)}`;

    // Razorpay order options
    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: receiptId,
    };

    // Razorpay pe order create karo
    const order = await razorpayInstance.orders.create(options);

    // DB me payment entry
    await paymentModel.create({
      user: userId,
      ride: ride._id,
      amount: amountInPaise,
      currency: "INR",
      status: "created",
      razorpay_order_id: order.id,
      receipt: receiptId,
    });

    // Frontend ke liye data bhejo
    return res.status(200).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID, // frontend is key se checkout open karega
    });
  } catch (err) {
    console.error("Create order error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to create payment order",
    });
  }
};

// 2️⃣ VERIFY PAYMENT CONTROLLER
export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      rideId,
      method, // e.g. "upi", "card", etc
    } = req.body;

    // basic validations
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing Razorpay payment details",
      });
    }

    // signature verify karne ke liye string
    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    // agar signature match nahi hua
    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    // payment record update karo
    const payment = await paymentModel.findOneAndUpdate(
      { razorpay_order_id },
      {
        status: "paid",
        method,
        razorpay_payment_id,
        razorpay_signature,
      },
      { new: true }
    );

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment record not found",
      });
    }

    // ride complete mark karo
    if (rideId) {
      await rideModel.findByIdAndUpdate(rideId, {
        status: "completed",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      payment,
    });
  } catch (err) {
    console.error("Verify payment error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to verify payment",
    });
  }
};

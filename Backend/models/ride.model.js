// models/ride.model.js

import mongoose from "mongoose";

const rideSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    captain: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "captain",
    },
    pickup: {
      type: String,
      required: true,
    },
    destination: {
      type: String,
      required: true,
    },
    fare: {
      type: Number,
      required: true,
    },

    // 👉 ADD: kis vehicle type se ride hui
    vehicleType: {
      type: String,
      enum: ["auto", "car", "moto"],
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "ongoing", "completed", "cancelled"],
      default: "pending",
    },

    duration: {
      type: Number, // seconds
    },

    distance: {
      type: Number, // meters
    },

    paymentID: {
      type: String,
    },
    orderId: {
      type: String,
    },
    signature: {
      type: String,
    },

    otp: {
      type: String,
      select: false,
      required: true,
    },
  },
  {
    // 👉 ADD: createdAt / updatedAt
    timestamps: true,
  }
);

const RideModel = mongoose.model("ride", rideSchema);

export default RideModel;
  
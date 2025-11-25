// controllers/captain.controller.js

import captainModel from "../models/captain.model.js";
import * as captainService from "../services/captain.service.js";
import blackListTokenModel from "../models/blackListToken.model.js";
import { validationResult } from "express-validator";
import crypto from "crypto";
import rideModel from "../models/ride.model.js"; // summary ke liye

export const registerCaptain = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { fullname, email, password, vehicle } = req.body;

  const isCaptainAlreadyExist = await captainModel.findOne({ email });

  if (isCaptainAlreadyExist) {
    return res.status(400).json({ message: "Captain already exist" });
  }

  const hashedPassword = await captainModel.hashPassword(password);

  const captain = await captainService.createCaptain({
    firstname: fullname.firstname,
    lastname: fullname.lastname,
    email,
    password: hashedPassword,
    color: vehicle.color,
    plate: vehicle.plate,
    capacity: vehicle.capacity,
    vehicleType: vehicle.vehicleType,
  });

  const token = captain.generateAuthToken();

  res.status(201).json({ token, captain });
};

export const loginCaptain = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  const captain = await captainModel.findOne({ email }).select("+password");

  if (!captain) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const isMatch = await captain.comparePassword(password);

  if (!isMatch) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const token = captain.generateAuthToken();

  res.cookie("token", token);

  res.status(200).json({ token, captain });
};

export const getCaptainProfile = async (req, res, next) => {
  res.status(200).json({ captain: req.captain });
};

export const logoutCaptain = async (req, res, next) => {
  const token =
    req.cookies?.token || req.headers.authorization?.split(" ")[1];

  if (token) {
    await blackListTokenModel.create({ token });
  }

  res.clearCookie("token");

  res.status(200).json({ message: "Logout successfully" });
};

// ---------- ONLINE / OFFLINE STATUS ----------
export const updateCaptainStatus = async (req, res, next) => {
  const { status } = req.body; // "active" / "inactive"

  if (!["active", "inactive"].includes(status)) {
    return res.status(400).json({ message: "Invalid status value" });
  }

  const captain = req.captain;
  captain.status = status;
  await captain.save();

  res.status(200).json({ status: captain.status });
};

// ---------- SUMMARY: trips + earnings ----------
export const getCaptainSummary = async (req, res, next) => {
  try {
    const captainId = req.captain._id;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Completed rides today
    const todayRides = await rideModel.find({
      captain: captainId,
      status: "completed",
      createdAt: { $gte: todayStart, $lte: todayEnd },
    });

    const todayTrips = todayRides.length;
    const todayEarnings = todayRides.reduce(
      (sum, ride) => sum + (ride.fare || 0),
      0
    );

    // All-time completed rides
    const allRides = await rideModel.find({
      captain: captainId,
      status: "completed",
    });

    const totalTrips = allRides.length;
    const totalEarnings = allRides.reduce(
      (sum, ride) => sum + (ride.fare || 0),
      0
    );

    return res.status(200).json({
      todayTrips,
      todayEarnings,
      totalTrips,
      totalEarnings,
      status: req.captain.status || "inactive",
      onlineMinutes: 0, // future me tracking add kar sakte ho
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to load summary" });
  }
};

// ---------- FORGOT PASSWORD ----------
export const forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  const captain = await captainModel.findOne({ email });
  if (!captain) {
    // security: generic message
    return res.status(200).json({
      message:
        "If this email is registered, a reset link has been generated.",
    });
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expires = Date.now() + 60 * 60 * 1000; // 1 hour

  captain.resetPasswordToken = token;
  captain.resetPasswordExpires = expires;
  await captain.save();

  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const resetLink = `${frontendUrl}/captain-reset-password/${token}`;

  return res.status(200).json({
    message: "Reset link generated.",
    resetLink,
  });
};

// ---------- RESET PASSWORD ----------
export const resetPassword = async (req, res, next) => {
  const { token, password } = req.body;

  const captain = await captainModel.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!captain) {
    return res
      .status(400)
      .json({ message: "Invalid or expired reset token" });
  }

  const hashed = await captainModel.hashPassword(password);
  captain.password = hashed;
  captain.resetPasswordToken = undefined;
  captain.resetPasswordExpires = undefined;

  await captain.save();

  return res.status(200).json({ message: "Password reset successfully" });
};

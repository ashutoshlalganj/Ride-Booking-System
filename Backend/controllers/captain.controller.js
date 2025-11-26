// controllers/captain.controller.js

import captainModel from "../models/captain.model.js";
import * as captainService from "../services/captain.service.js";
import blackListTokenModel from "../models/blackListToken.model.js";
import { validationResult } from "express-validator";
import rideModel from "../models/ride.model.js";
import { generateOTP, sendOtpEmail } from "../utils/email.js";

// ---------- REGISTER CAPTAIN (2-STEP OTP) ----------
export const registerCaptain = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { fullname, email, password, vehicle, otp } = req.body;

  try {
    // STEP 1: send OTP
    if (!otp) {
      let captain = await captainModel.findOne({ email }).select("+password");

      if (captain && captain.isVerified === true) {
        return res.status(400).json({ message: "Captain already exist" });
      }

      const hashedPassword = await captainModel.hashPassword(password);
      const code = generateOTP();
      const expires = new Date(Date.now() + 10 * 60 * 1000);

      if (captain) {
        // existing but not verified → update details + OTP
        captain.fullname.firstname = fullname.firstname;
        captain.fullname.lastname = fullname.lastname;
        captain.password = hashedPassword;
        captain.vehicle.color = vehicle.color;
        captain.vehicle.plate = vehicle.plate;
        captain.vehicle.capacity = vehicle.capacity;
        captain.vehicle.vehicleType = vehicle.vehicleType;
        captain.signupOtp = code;
        captain.signupOtpExpires = expires;
        await captain.save();
      } else {
        // new captain via service
        captain = await captainService.createCaptain({
          firstname: fullname.firstname,
          lastname: fullname.lastname,
          email,
          password: hashedPassword,
          color: vehicle.color,
          plate: vehicle.plate,
          capacity: vehicle.capacity,
          vehicleType: vehicle.vehicleType,
        });

        captain.signupOtp = code;
        captain.signupOtpExpires = expires;
        await captain.save();
      }

      await sendOtpEmail(
        email,
        "Taxi – Captain account verification",
        code
      );

      return res
        .status(200)
        .json({ message: "OTP sent to your email for captain verification" });
    }

    // STEP 2: verify OTP & complete
    const captain = await captainModel.findOne({
      email,
      signupOtp: otp,
      signupOtpExpires: { $gt: Date.now() },
    });

    if (!captain) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    captain.isVerified = true;
    captain.signupOtp = undefined;
    captain.signupOtpExpires = undefined;
    await captain.save();

    const token = captain.generateAuthToken();
    res.cookie("token", token);

    return res.status(201).json({ token, captain });
  } catch (err) {
    console.error("REGISTER CAPTAIN ERROR:", err);
    return res.status(500).json({
      message: "Something went wrong while creating captain account",
    });
  }
};

// ---------- LOGIN ----------
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

  if (captain.isVerified === false) {
    return res
      .status(403)
      .json({ message: "Please verify your email with OTP first" });
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
      onlineMinutes: 0,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to load summary" });
  }
};

// ---------- FORGOT PASSWORD (send OTP) ----------
export const forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  const captain = await captainModel.findOne({ email });
  if (!captain) {
    return res.status(200).json({
      message: "If this email is registered, an OTP has been sent.",
    });
  }

  const otp = generateOTP();
  const expires = new Date(Date.now() + 10 * 60 * 1000);

  captain.resetPasswordOtp = otp;
  captain.resetPasswordExpires = expires;
  await captain.save();

  await sendOtpEmail(
    email,
    "Taxi – Captain password reset OTP",
    otp
  );

  return res.status(200).json({
    message: "If this email is registered, an OTP has been sent.",
  });
};

// ---------- RESET PASSWORD (OTP + NEW PASSWORD) ----------
export const resetPassword = async (req, res, next) => {
  const { email, otp, password } = req.body;

  const captain = await captainModel.findOne({
    email,
    resetPasswordOtp: otp,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!captain) {
    return res
      .status(400)
      .json({ message: "Invalid or expired OTP" });
  }

  const hashed = await captainModel.hashPassword(password);
  captain.password = hashed;
  captain.resetPasswordOtp = undefined;
  captain.resetPasswordExpires = undefined;

  await captain.save();

  return res.status(200).json({ message: "Password reset successfully" });
};

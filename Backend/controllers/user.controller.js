// controllers/user.controller.js

import userModel from "../models/user.model.js";
import * as userService from "../services/user.service.js";
import { validationResult } from "express-validator";
import blackListTokenModel from "../models/blackListToken.model.js";
import crypto from "crypto";

// ================== REGISTER USER ==================
export const registerUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { fullname, email, password } = req.body;

  const isUserAlready = await userModel.findOne({ email });

  if (isUserAlready) {
    return res.status(400).json({ message: "User already exist" });
  }

  // ⚠️ Yahan password ko hash NAHI karna
  // Plain password service ko bhej rahe hain, wahan hash hoga
  const user = await userService.createUser({
    firstname: fullname.firstname,
    lastname: fullname.lastname,
    email,
    password, // <- plain password
  });

  const token = user.generateAuthToken();

  res.status(201).json({ token, user });
};

// ================== LOGIN USER ==================
export const loginUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  const user = await userModel.findOne({ email }).select("+password");

  if (!user) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const token = user.generateAuthToken();

  res.cookie("token", token);

  res.status(200).json({ token, user });
};

// ================== GET USER PROFILE ==================
export const getUserProfile = async (req, res, next) => {
  res.status(200).json(req.user);
};

// ================== LOGOUT USER ==================
export const logoutUser = async (req, res, next) => {
  res.clearCookie("token");
  const token =
    req.cookies.token || req.headers.authorization?.split(" ")[1];

  if (token) {
    await blackListTokenModel.create({ token });
  }

  res.status(200).json({ message: "Logged out" });
};

// ================== FORGOT PASSWORD ==================
export const forgotPassword = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  const user = await userModel.findOne({ email });

  // Security ke liye generic response, chahe user ho ya na ho
  if (!user) {
    return res
      .status(200)
      .json({ message: "If this email exists, reset link has been sent" });
  }

  // Random token generate karo
  const resetToken = crypto.randomBytes(32).toString("hex");
  // ✅ yahan Date object use karo
  const resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = resetPasswordExpires;

  await user.save();

  // Frontend reset URL (.env me FRONTEND_URL set hona chahiye)
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  // Dev ke liye console me print
  console.log("Password reset link:", resetUrl);

  return res
    .status(200)
    .json({ message: "If this email exists, reset link has been sent" });
};

// ================== RESET PASSWORD ==================
export const resetPassword = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { token, password } = req.body;

  if (!token || !password) {
    return res
      .status(400)
      .json({ message: "Token and new password are required" });
  }

  // Valid (non-expired) token ke basis par user dhundo
  const user = await userModel
    .findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    })
    .select("+password");

  if (!user) {
    return res.status(400).json({ message: "Invalid or expired token" });
  }

  const hashedPassword = await userModel.hashPassword(password);

  user.password = hashedPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  await user.save();

  return res.status(200).json({ message: "Password reset successfully" });
};

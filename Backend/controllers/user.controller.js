// controllers/user.controller.js

import userModel from "../models/user.model.js";
import { validationResult } from "express-validator";
import blackListTokenModel from "../models/blackListToken.model.js";
import crypto from "crypto";

// ================== REGISTER USER ==================
export const registerUser = async (req, res) => {
  // 1) Validation error ko readable bana diya
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const firstError = errors.array()[0]?.msg || "Invalid input";
    return res.status(400).json({
      message: firstError,
      errors: errors.array(),
    });
  }

  try {
    const { fullname, email, password } = req.body;

    if (!fullname || !fullname.firstname) {
      return res
        .status(400)
        .json({ message: "First name (fullname.firstname) is required" });
    }

    // 2) Already existing user check
    const isUserAlready = await userModel.findOne({ email });
    if (isUserAlready) {
      return res.status(400).json({ message: "User already exist" });
    }

    // 3) Password hash yahi par (userService ki dependency hata di)
    const hashedPassword = await userModel.hashPassword(password);

    const user = await userModel.create({
      fullname: {
        firstname: fullname.firstname,
        lastname: fullname.lastname,
      },
      email,
      password: hashedPassword,
    });

    const token = user.generateAuthToken();

    return res.status(201).json({ token, user });
  } catch (err) {
    console.error("REGISTER USER ERROR:", err);
    return res.status(500).json({
      message: "Something went wrong while creating account",
    });
  }
};

// ================== LOGIN USER ==================
export const loginUser = async (req, res) => {
  // 1) Validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const firstError = errors.array()[0]?.msg || "Invalid input";
    return res.status(400).json({
      message: firstError,
      errors: errors.array(),
    });
  }

  try {
    const { email, password } = req.body;

    // 2) User find + password field include
    const user = await userModel.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // 3) Password compare
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // 4) Token generate
    const token = user.generateAuthToken();

    // Cookie optional hai (frontend already token ko localStorage me store kar raha hai)
    res.cookie("token", token);

    return res.status(200).json({ token, user });
  } catch (err) {
    console.error("LOGIN USER ERROR:", err);
    return res.status(500).json({
      message: "Something went wrong while logging in",
    });
  }
};

// ================== GET USER PROFILE ==================
export const getUserProfile = async (req, res) => {
  return res.status(200).json(req.user);
};

// ================== LOGOUT USER ==================
export const logoutUser = async (req, res) => {
  try {
    res.clearCookie("token");

    const token =
      req.cookies.token || req.headers.authorization?.split(" ")[1];

    if (token) {
      await blackListTokenModel.create({ token });
    }

    return res.status(200).json({ message: "Logged out" });
  } catch (err) {
    console.error("LOGOUT ERROR:", err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// ================== FORGOT PASSWORD ==================
export const forgotPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const firstError = errors.array()[0]?.msg || "Invalid input";
    return res.status(400).json({
      message: firstError,
      errors: errors.array(),
    });
  }

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await userModel.findOne({ email });

    // Security: same response chahe user ho ya na ho
    if (!user) {
      return res.status(200).json({
        message: "If this email exists, reset link has been sent",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 min

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetPasswordExpires;
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    console.log("Password reset link:", resetUrl);

    return res.status(200).json({
      message: "If this email exists, reset link has been sent",
    });
  } catch (err) {
    console.error("FORGOT PASSWORD ERROR:", err);
    return res.status(500).json({
      message: "Something went wrong while sending reset link",
    });
  }
};

// ================== RESET PASSWORD ==================
export const resetPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const firstError = errors.array()[0]?.msg || "Invalid input";
    return res.status(400).json({
      message: firstError,
      errors: errors.array(),
    });
  }

  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res
        .status(400)
        .json({ message: "Token and new password are required" });
    }

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
  } catch (err) {
    console.error("RESET PASSWORD ERROR:", err);
    return res.status(500).json({
      message: "Something went wrong while resetting password",
    });
  }
};

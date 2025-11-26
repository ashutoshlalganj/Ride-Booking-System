// controllers/user.controller.js

import userModel from "../models/user.model.js";
import { validationResult } from "express-validator";
import blackListTokenModel from "../models/blackListToken.model.js";
import { generateOTP, sendOtpEmail } from "../utils/email.js";

// ================== REGISTER USER (2-STEP OTP) ==================
export const registerUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const firstError = errors.array()[0]?.msg || "Invalid input";
    return res.status(400).json({
      message: firstError,
      errors: errors.array(),
    });
  }

  try {
    const { fullname, email, password, otp } = req.body;

    // STEP 1: OTP send
    if (!otp) {
      if (!fullname || !fullname.firstname) {
        return res
          .status(400)
          .json({ message: "First name (fullname.firstname) is required" });
      }

      let user = await userModel.findOne({ email }).select("+password");

      // already verified user
      if (user && user.isVerified === true) {
        return res.status(400).json({ message: "User already exist" });
      }

      const hashedPassword = await userModel.hashPassword(password);
      const code = generateOTP();
      const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 min

      if (user) {
        // existing but not verified → overwrite details + OTP
        user.fullname.firstname = fullname.firstname;
        user.fullname.lastname = fullname.lastname;
        user.password = hashedPassword;
        user.signupOtp = code;
        user.signupOtpExpires = expires;
        await user.save();
      } else {
        // new user
        user = await userModel.create({
          fullname: {
            firstname: fullname.firstname,
            lastname: fullname.lastname,
          },
          email,
          password: hashedPassword,
          isVerified: false,
          signupOtp: code,
          signupOtpExpires: expires,
        });
      }

      await sendOtpEmail(email, "Taxi – Verify your email", code);

      return res
        .status(200)
        .json({ message: "OTP sent to your email for verification" });
    }

    // STEP 2: OTP verify + complete registration
    const user = await userModel.findOne({
      email,
      signupOtp: otp,
      signupOtpExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.isVerified = true;
    user.signupOtp = undefined;
    user.signupOtpExpires = undefined;
    await user.save();

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

    const user = await userModel.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Only block if explicitly false (purane users me isVerified undefined ho sakta hai)
    if (user.isVerified === false) {
      return res
        .status(403)
        .json({ message: "Please verify your email with OTP first" });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = user.generateAuthToken();
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
      req.cookies?.token || req.headers.authorization?.split(" ")[1];

    if (token) {
      await blackListTokenModel.create({ token });
    }

    return res.status(200).json({ message: "Logged out" });
  } catch (err) {
    console.error("LOGOUT ERROR:", err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// ================== FORGOT PASSWORD (send OTP) ==================
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

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(200).json({
        message: "If this email exists, an OTP has been sent",
      });
    }

    const otp = generateOTP();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    user.resetPasswordOtp = otp;
    user.resetPasswordExpires = expires;
    await user.save();

    await sendOtpEmail(email, "Taxi – Password reset OTP", otp);

    return res.status(200).json({
      message: "If this email exists, an OTP has been sent",
    });
  } catch (err) {
    console.error("FORGOT PASSWORD ERROR:", err);
    return res.status(500).json({
      message: "Something went wrong while sending OTP",
    });
  }
};

// ================== RESET PASSWORD (OTP + NEW PASSWORD) ==================
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
    const { email, otp, password } = req.body;

    const user = await userModel
      .findOne({
        email,
        resetPasswordOtp: otp,
        resetPasswordExpires: { $gt: Date.now() },
      })
      .select("+password");

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const hashedPassword = await userModel.hashPassword(password);

    user.password = hashedPassword;
    user.resetPasswordOtp = undefined;
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

// ================== SAVED PLACES ==================

export const getSavedPlaces = async (req, res) => {
  try {
    const user = await userModel
      .findById(req.user._id)
      .select("savedPlaces");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user.savedPlaces || []);
  } catch (err) {
    console.error("GET SAVED PLACES ERROR:", err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const addSavedPlace = async (req, res) => {
  try {
    const { label, address } = req.body;

    if (!label || !address) {
      return res
        .status(400)
        .json({ message: "Label and address are required" });
    }

    const user = await userModel.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const already = (user.savedPlaces || []).find(
      (p) =>
        p.address.toLowerCase() === address.toLowerCase() &&
        p.label.toLowerCase() === label.toLowerCase()
    );

    if (already) {
      return res
        .status(200)
        .json({ message: "Place already saved", savedPlaces: user.savedPlaces });
    }

    user.savedPlaces.push({ label, address });
    await user.save();

    return res.status(201).json({
      message: "Place saved",
      savedPlaces: user.savedPlaces,
    });
  } catch (err) {
    console.error("ADD SAVED PLACE ERROR:", err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// routes/captain.routes.js

import express from "express";
import { body } from "express-validator";
import * as captainController from "../controllers/captain.controller.js";
import * as authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

// REGISTER (2-step OTP)
router.post(
  "/register",
  [
    body("email").isEmail().withMessage("Invalid Email"),
    body("fullname.firstname")
      .isLength({ min: 3 })
      .withMessage("First name must be at least 3 characters long"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
    body("vehicle.color")
      .isLength({ min: 3 })
      .withMessage("Color must be at least 3 characters long"),
    body("vehicle.plate")
      .isLength({ min: 3 })
      .withMessage("Plate must be at least 3 characters long"),
    body("vehicle.capacity")
      .isInt({ min: 1 })
      .withMessage("Capacity must be at least 1"),
    body("vehicle.vehicleType")
      .isIn(["car", "moto", "auto"])
      .withMessage("Invalid vehicle type"),
  ],
  captainController.registerCaptain
);

// LOGIN
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Invalid Email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  captainController.loginCaptain
);

// PROFILE
router.get(
  "/profile",
  authMiddleware.authCaptain,
  captainController.getCaptainProfile
);

// LOGOUT
router.get(
  "/logout",
  authMiddleware.authCaptain,
  captainController.logoutCaptain
);

// ONLINE / OFFLINE STATUS UPDATE
router.patch(
  "/status",
  authMiddleware.authCaptain,
  captainController.updateCaptainStatus
);

// CAPTAIN SUMMARY
router.get(
  "/summary",
  authMiddleware.authCaptain,
  captainController.getCaptainSummary
);

// FORGOT PASSWORD (OTP)
router.post("/forgot-password", captainController.forgotPassword);

// RESET PASSWORD (email + OTP + new password)
router.post(
  "/reset-password",
  [
    body("email").isEmail().withMessage("Invalid Email"),
    body("otp").isLength({ min: 4 }).withMessage("OTP is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  captainController.resetPassword
);

export default router;

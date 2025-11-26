// routes/user.routes.js

import express from "express";
import { body } from "express-validator";
import * as userController from "../controllers/user.controller.js";
import * as authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

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
  ],
  userController.registerUser
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Invalid Email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  userController.loginUser
);

// Forgot password – send OTP
router.post(
  "/forgot-password",
  [body("email").isEmail().withMessage("Invalid Email")],
  userController.forgotPassword
);

// Reset password – email + OTP + new password
router.post(
  "/reset-password",
  [
    body("email").isEmail().withMessage("Invalid Email"),
    body("otp").isLength({ min: 4 }).withMessage("OTP is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  userController.resetPassword
);

// Profile
router.get(
  "/profile",
  authMiddleware.authUser,
  userController.getUserProfile
);

// Logout
router.get("/logout", authMiddleware.authUser, userController.logoutUser);

// ⭐ Saved places
router.get(
  "/saved-places",
  authMiddleware.authUser,
  userController.getSavedPlaces
);

router.post(
  "/saved-places",
  authMiddleware.authUser,
  [
    body("label").notEmpty().withMessage("Label is required"),
    body("address")
      .isString()
      .isLength({ min: 3 })
      .withMessage("Address too short"),
  ],
  userController.addSavedPlace
);

export default router;

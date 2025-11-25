// Backend/routes/payment.routes.js

import express from "express";
import * as paymentController from "../controllers/payment.controller.js";
import * as authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

// user logged in hona chahiye
router.post(
  "/create-order",
  authMiddleware.authUser,
  paymentController.createOrder
);

router.post(
  "/verify",
  authMiddleware.authUser,
  paymentController.verifyPayment
);

export default router;


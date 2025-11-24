// routes/maps.routes.js

import express from "express";
import { query } from "express-validator";
import * as authMiddleware from "../middlewares/auth.middleware.js";
import * as mapController from "../controllers/map.controller.js";

const router = express.Router();

// GET /maps/get-coordinates?address=...
router.get(
  "/get-coordinates",
  query("address").isString().isLength({ min: 3 }),
  authMiddleware.authUser,
  mapController.getCoordinates
);

// GET /maps/get-distance-time?origin=...&destination=...
router.get(
  "/get-distance-time",
  query("origin").isString().isLength({ min: 3 }),
  query("destination").isString().isLength({ min: 3 }),
  authMiddleware.authUser,
  mapController.getDistanceTime
);

// GET /maps/get-suggestions?input=New+De
router.get(
  "/get-suggestions",
  query("input").isString().isLength({ min: 3 }),
  authMiddleware.authUser,
  mapController.getAutoCompleteSuggestions
);

export default router;

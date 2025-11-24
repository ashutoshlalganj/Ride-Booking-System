// controllers/map.controller.js

import * as mapService from "../services/maps.service.js";
import { validationResult } from "express-validator";

export const getCoordinates = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { address } = req.query;

  try {
    const coordinates = await mapService.getAddressCoordinate(address);
    return res.status(200).json(coordinates);
  } catch (error) {
    console.error("getCoordinates error:", error.message);
    return res.status(404).json({ message: "Coordinates not found" });
  }
};

export const getDistanceTime = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { origin, destination } = req.query;

    const distanceTime = await mapService.getDistanceTime(
      origin,
      destination
    );

    return res.status(200).json(distanceTime);
  } catch (err) {
    console.error("getDistanceTime error:", err.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getAutoCompleteSuggestions = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { input } = req.query;

    const suggestions = await mapService.getAutoCompleteSuggestions(input);

    // yahan hum plain string array bhej rahe hain
    return res.status(200).json(suggestions);
  } catch (err) {
    console.error("getAutoCompleteSuggestions error:", err.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// controllers/ride.controller.js

import * as rideService from "../services/ride.service.js";
import { validationResult } from "express-validator";
import * as mapService from "../services/maps.service.js";
import { sendMessageToSocketId } from "../socket.js";
import rideModel from "../models/ride.model.js";

// ---------------- CREATE & FARE ----------------

export const createRide = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { pickup, destination, vehicleType } = req.body;

  try {
    const ride = await rideService.createRide({
      user: req.user._id,
      pickup,
      destination,
      vehicleType,
    });

    res.status(201).json(ride);

    const pickupCoordinates = await mapService.getAddressCoordinate(pickup);

    const captainsInRadius = await mapService.getCaptainsInTheRadius(
      pickupCoordinates.ltd,
      pickupCoordinates.lng,
      2
    );

    ride.otp = "";

    const rideWithUser = await rideModel
      .findOne({ _id: ride._id })
      .populate("user");

    captainsInRadius.forEach((captain) => {
      sendMessageToSocketId(captain.socketId, {
        event: "new-ride",
        data: rideWithUser,
      });
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err.message });
  }
};

export const getFare = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { pickup, destination } = req.query;

  try {
    const fare = await rideService.getFare(pickup, destination);
    return res.status(200).json(fare);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// ---------------- CAPTAIN FLOW ----------------

export const confirmRide = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { rideId } = req.body;

  try {
    const ride = await rideService.confirmRide({
      rideId,
      captain: req.captain,
    });

    sendMessageToSocketId(ride.user.socketId, {
      event: "ride-confirmed",
      data: ride,
    });

    return res.status(200).json(ride);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err.message });
  }
};

export const startRide = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { rideId, otp } = req.query;

  try {
    const ride = await rideService.startRide({
      rideId,
      otp,
      captain: req.captain,
    });

    sendMessageToSocketId(ride.user.socketId, {
      event: "ride-started",
      data: ride,
    });

    return res.status(200).json(ride);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// ✅ Captain: END RIDE – yahan service pe depend nahi kar rahe, directly DB

export const endRide = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { rideId } = req.body;

  try {
    // sirf wahi ride jisme ye captain assigned hai
    let ride = await rideModel
      .findOne({
        _id: rideId,
        captain: req.captain._id,
      })
      .populate("user")
      .populate("captain");

    if (!ride) {
      return res
        .status(404)
        .json({ message: "Ride not found for this captain" });
    }

    // already completed ho to bhi OK
    if (ride.status !== "completed") {
      ride.status = "completed";
      // optional: ride.endedAt = new Date();
      await ride.save();
    }

    // user ko notify karo
    if (ride.user?.socketId) {
      sendMessageToSocketId(ride.user.socketId, {
        event: "ride-ended",
        data: ride,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Ride ended successfully",
      ride,
    });
  } catch (err) {
    console.log("End ride error:", err);
    return res.status(500).json({ message: "Failed to end ride" });
  }
};

// ---------------- RIDES LIST ----------------

export const getUserRides = async (req, res) => {
  try {
    const rides = await rideModel
      .find({ user: req.user._id })
      .populate("captain")
      .sort({ createdAt: -1 });

    return res.status(200).json(rides);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getCaptainRides = async (req, res) => {
  try {
    const rides = await rideModel
      .find({ captain: req.captain._id })
      .populate("user")
      .sort({ createdAt: -1 });

    return res.status(200).json(rides);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// ---------------- USER: CASH COMPLETE ----------------

export const completeRideCash = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { rideId } = req.body;

  try {
    let ride = await rideModel
      .findById(rideId)
      .populate("user")
      .populate("captain");

    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    if (ride.user._id.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not allowed to update this ride" });
    }

    if (ride.status !== "completed") {
      ride.status = "completed";
      // optional: ride.paymentMethod = "cash";
      // ride.endedAt = new Date();
      await ride.save();
    }

    if (ride.captain && ride.captain.socketId) {
      sendMessageToSocketId(ride.captain.socketId, {
        event: "ride-ended",
        data: ride,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Ride completed successfully (cash).",
      ride,
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to complete ride" });
  }
};

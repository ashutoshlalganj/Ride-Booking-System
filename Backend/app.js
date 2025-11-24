// app.js

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

import userRoutes from "./routes/user.routes.js";
import captainRoutes from "./routes/captain.routes.js";
import rideRoutes from "./routes/ride.routes.js";
import mapsRoutes from "./routes/maps.routes.js"; // ✅ NEW

dotenv.config();

const app = express();

// ------------ CORS CONFIG (IMPORTANT) ------------
const allowedOrigins = [
  "http://localhost:5173",
  "https://localhost:5173",
  process.env.FRONTEND_URL, // e.g. https://skb5nx5w-5173.inc1.devtunnels.ms
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Postman ya server-side ke liye (origin null hota hai)
      if (!origin) return callback(null, true);

      if (
        allowedOrigins.includes(origin) ||
        (origin && origin.endsWith(".devtunnels.ms")) // koi bhi devtunnel allow
      ) {
        return callback(null, true);
      }

      console.log("❌ CORS blocked origin:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
// -------------------------------------------------

app.use(express.json());
app.use(cookieParser());

// ------------ ROUTES ------------
app.use("/users", userRoutes);
app.use("/captains", captainRoutes);
app.use("/rides", rideRoutes);
app.use("/maps", mapsRoutes); // ✅ yahi se /maps/get-suggestions, etc. chalega
// -------------------------------

app.get("/", (req, res) => {
  res.send("Taxi backend is running ✅");
});

export default app;



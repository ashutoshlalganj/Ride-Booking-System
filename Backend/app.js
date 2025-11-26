// app.js

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

import userRoutes from "./routes/user.routes.js";
import captainRoutes from "./routes/captain.routes.js";
import rideRoutes from "./routes/ride.routes.js";
import mapsRoutes from "./routes/maps.routes.js";
import paymentRoutes from "./routes/payment.routes.js"; // Razorpay / payments

dotenv.config();

const app = express();

// ------------ CORS CONFIG ------------

const allowedOrigins = [
  "http://localhost:5173",
  "https://localhost:5173",
  process.env.FRONTEND_URL, // devtunnel ya vercel
].filter(Boolean); // undefined/null hata dega

app.use(
  cors({
    origin: (origin, callback) => {
      // Postman / server-side: origin null hota hai
      if (!origin) return callback(null, true);

      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith(".devtunnels.ms") // koi bhi devtunnel
      ) {
        return callback(null, true);
      }

      console.log("❌ CORS blocked origin:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// ------------------------------------

app.use(express.json());
app.use(cookieParser());

// ------------ ROUTES ------------

app.use("/users", userRoutes);
app.use("/captains", captainRoutes);
app.use("/rides", rideRoutes);
app.use("/maps", mapsRoutes);
app.use("/payments", paymentRoutes);

app.get("/", (req, res) => {
  res.send("Taxi backend is running ✅");
});

export default app;

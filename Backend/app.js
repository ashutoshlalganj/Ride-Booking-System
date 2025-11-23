// app.js  (ES Module version)

import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import connectToDb from "./db/db.js";
import userRoutes from "./routes/user.routes.js";
import captainRoutes from "./routes/captain.routes.js";
import mapsRoutes from "./routes/maps.routes.js";
import rideRoutes from "./routes/ride.routes.js";

const app = express();

connectToDb();


app.use(
  cors({
    origin: "https://skb5nx5w-5173.inc1.devtunnels.ms", // your FRONTEND tunnel URL
    credentials: true,
  })
);




app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use("/users", userRoutes);
app.use("/captains", captainRoutes);
app.use("/maps", mapsRoutes);
app.use("/rides", rideRoutes);

export default app;

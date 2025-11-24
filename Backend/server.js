// server.js
import dotenv from "dotenv";
import http from "http";
import app from "./app.js";
import { initializeSocket } from "./socket.js";
import connectToDb from "./db/db.js";   // ✅ DB connect function

dotenv.config();

// ✅ MongoDB se connect
connectToDb();

const PORT = process.env.PORT || 4000;

const server = http.createServer(app);

// ✅ socket.io init
initializeSocket(server);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

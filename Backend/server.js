// server.js
import dotenv from "dotenv";
import http from "http";
import app from "./app.js";
import { initializeSocket } from "./socket.js";
import connectToDb from "./db/db.js";

dotenv.config();

const PORT = process.env.PORT || 4000;

const server = http.createServer(app);

// socket.io init
initializeSocket(server);

async function startServer() {
  // 🔹 1. Pehle DB connect
  await connectToDb();

  // 🔹 2. Phir hi server listen kare
  server.listen(PORT, () => {
    console.log(`🚕 Server is running on port ${PORT}`);
  });
}

startServer();

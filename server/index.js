import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import { connectDB } from "./src/services/db.js";
import Chat from "./src/models/chat.model.js";

// Load environment variables
dotenv.config();
connectDB();

// Express app and HTTP server
const app = express();
const server = http.createServer(app);

// Socket.IO setup with CORS
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));

// Routes
import { userRouter } from "./src/routes/index.js";
app.use("/api/admins", userRouter);

import { driverRouter } from "./src/routes/index.js";
app.use("/api/driver", driverRouter);

import { passengerRouter } from "./src/routes/index.js";
app.use("/api/passenger", passengerRouter);

// API: Get messages between 2 users
app.get("/api/messages/:user1/:user2", async (req, res) => {
  const { user1, user2 } = req.params;

  try {
    const messages = await Chat.find({
      $or: [
        { sender: user1, receiver: user2 },
        { sender: user2, receiver: user1 }
      ]
    }).sort({ timestamp: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// SOCKET.IO: Real-Time Private Chat
io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.id);

  // Join user's private room
  socket.on("join", (username) => {
    socket.join(username);
    console.log(`🔗 ${username} joined their private room`);
  });

  // Send message from sender to receiver
  socket.on("sendMessage", async ({ sender, receiver, message }) => {
    console.log(`📩 ${sender} to ${receiver}: ${message}`);

    // Save message to DB
    const newMessage = new Chat({ sender, receiver, message });
    await newMessage.save();

    // Emit message to only sender and receiver
    io.to(sender).emit("receiveMessage", { sender, receiver, message });
    io.to(receiver).emit("receiveMessage", { sender, receiver, message });
  });

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
  });
});

// Start the server
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});

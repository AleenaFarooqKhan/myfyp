import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { connectDB } from "./src/services/db.js";
import Chat from "./src/models/chat.model.js";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  }
});

const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));

// ✅ API Routes
import { userRouter } from "./src/routes/index.js";
app.use("/api/admins", userRouter);
import { driverRouter } from "./src/routes/index.js";
app.use("/api/driver", driverRouter);
import { passengerRouter } from "./src/routes/index.js";
app.use("/api/passenger", passengerRouter);

// ✅ Get messages between 2 users
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

// ✅ Real-Time Chat with Socket.IO
io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.id);

  socket.on("sendMessage", async ({ sender, receiver, message }) => {
    console.log(`📩 ${sender} to ${receiver}: ${message}`);

    // ✅ Save message to MongoDB
    const newMessage = new Chat({ sender, receiver, message });
    await newMessage.save();

    // 🔁 Emit message to all connected clients
    io.emit("receiveMessage", { sender, receiver, message });
  });

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
  });
});


server.listen(PORT, "0.0.0.0", () => {
  console.log(` Server is running on port ${PORT}`);
});

app.get("/api/messages/:user1/:user2", async (req, res) => {
  const { user1, user2 } = req.params;

  try {
    const messages = await Chat.find({
      $or: [
        { sender: user1, receiver: user2 },
        { sender: user2, receiver: user1 }
      ]
    }).sort({ timestamp: 1 }); // Oldest to newest

    res.json(messages);
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});


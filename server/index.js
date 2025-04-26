import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { connectDB } from "./src/services/db.js";
import cors from "cors";
dotenv.config();
connectDB();
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

import { userRouter } from "./src/routes/index.js";
app.use("/api/admins", userRouter);
import { driverRouter } from "./src/routes/index.js";
app.use("/api/driver", driverRouter);
import { passengerRouter } from "./src/routes/index.js";
app.use("/api/passenger", passengerRouter);
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});

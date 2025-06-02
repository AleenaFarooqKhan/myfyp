import { passengerModel } from "../models/passengers.models.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { otpEmail } from "../services/mailer.js";

// Helper to generate 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000);

// Register passenger
export const registerPassenger = async (req, res) => {
  try {
    const { email, username, phoneNumber, password } = req.body;
    if (!username || !phoneNumber || !password || !email) {
      return res.status(407).json({ message: "Not all details are provided" });
    }

    const existingPassenger = await passengerModel.findOne({
      $or: [{ email }, { phoneNumber }],
    });

    if (existingPassenger) {
      return res
        .status(400)
        .json({ message: "Phone or email number already taken" });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);
    const otp = generateOTP();

    const newPassenger = await passengerModel.create({
      username,
      phoneNumber,
      email,
      password: hashedPassword,
      userOTP: otp,
    });

    await otpEmail(email, username, otp);

    res.status(201).json({ message: "Passenger created", newPassenger });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Login passenger
export const loginPassenger = async (req, res) => {
  try {
    const { phoneNumber, password } = req.body;
    if (!phoneNumber || !password) {
      return res.status(407).json({ message: "Not all details are provided" });
    }

    const passenger = await passengerModel.findOne({ phoneNumber });
    if (!passenger) {
      return res.status(404).json({ message: "User does not exist" });
    }

    const isPasswordValid = await bcryptjs.compare(
      password,
      passenger.password
    );
    if (!isPasswordValid) {
      return res.status(407).json({ message: "Invalid Password" });
    }

    const token = jwt.sign(
      { id: passenger._id },
      process.env.JWT_TOKEN_SECRET,
      {
        expiresIn: "5d",
      }
    );

    const options = {
      httpOnly: true,
      secure: true,
    };

    res
      .status(200)
      .cookie("token", token, options)
      .json({ message: "Passenger logged in", passenger });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Logout passenger
export const logOutPassenger = async (req, res) => {
  try {
    const options = {
      httpOnly: true,
      secure: true,
    };

    res
      .status(200)
      .clearCookie("token", options)
      .json({ message: "Passenger logged out" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all passengers (admin use)
export const allPassengers = async (req, res) => {
  try {
    const passengers = await passengerModel.find();
    res.status(200).json({ totalPassengers: passengers.length, passengers });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get passenger profile
export const getProfile = async (req, res) => {
  try {
    const passenger = await passengerModel
      .findById(req.user.id)
      .select("-password -userOTP");

    if (!passenger) {
      return res.status(404).json({ message: "Passenger not found" });
    }

    res.status(200).json(passenger);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update passenger profile
export const updateProfile = async (req, res) => {
  try {
    const { username, email, phoneNumber } = req.body;

    const passenger = await passengerModel.findById(req.user.id);
    if (!passenger) {
      return res.status(404).json({ message: "Passenger not found" });
    }

    if (username) passenger.username = username;
    if (email) passenger.email = email;
    if (phoneNumber) passenger.phoneNumber = phoneNumber;

    await passenger.save();

    res.status(200).json({ message: "Profile updated successfully" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Send OTP
export const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await passengerModel.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = generateOTP();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.otp = otp;
    user.otpExpires = expires;
    await user.save();

    await otpEmail(email, user.username || "Passenger", otp);

    console.log(`OTP for ${email}: ${otp}`); // For dev only
    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

// Verify OTP
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp)
      return res.status(400).json({ message: "Email and OTP are required" });

    const user = await passengerModel.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.otp || !user.otpExpires) {
      return res.status(400).json({ message: "OTP not requested" });
    }

    if (user.otpExpires < new Date()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    if (String(user.otp) !== String(otp)) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    user.otp = null;
    user.otpExpires = null;
    await user.save();

    res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Reset Password
export const resetPassword = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res
        .status(400)
        .json({ message: "Email and password are required" });

    const user = await passengerModel.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const hashedPassword = await bcryptjs.hash(password, 10);
    user.password = hashedPassword;
    user.otp = null;
    user.otpExpires = null;

    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Password reset error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


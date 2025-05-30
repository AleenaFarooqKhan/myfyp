import { passengerModel } from "../models/passengers.models.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { otpEmail } from "../services/mailer.js";
export const registerPassenger = async (req, res) => {
  try {
    const { email, username, phoneNumber, password } = req.body;
    if (!username || !phoneNumber || !password || !email) {
      return res.status(407).json({ message: "Not all details are provided" });
    }
    const exsitingPassenger = await passengerModel.findOne({
      $or: [{ email }, { phoneNumber }],
    });

    if (exsitingPassenger) {
      return res
        .status(400)
        .json({ message: "Phone or email number already taken" });
    }
    const hashedPassword = await bcryptjs.hash(password, 10);
    const otp = Math.floor(Math.random() * 100000);
    const newPassenger = await passengerModel.create({
      username,
      phoneNumber,
      email,
      password: hashedPassword,
      userOTP:otp
    });

    await otpEmail(email, username, otp);
    res.status(201).json({ message: "Passenger created", newPassenger });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const loginInPassenger = async (req, res) => {
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
    const isConfirmed = passenger.isConfirmed;
    if (!isConfirmed) {
      return res
        .status(407)
        .json({ message: "Your account is not confirmed yet." });
    }
    const token = jwt.sign(
      { id: passenger._id },
      process.env.JWT_TOKEN_SECRET,
      { expiresIn: "5d" }
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

export const allPassengers = async (req, res) => {
  try {
    const passengers = await passengerModel.find();
    res.status(200).json({ totalPassengers: passengers.length, passengers });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const verifyOtp = async (req, res) => {
  console.log("request recieved");
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: "Invalid request" });
    }
    const passenger = await passengerModel.findOne({ email });
    if (!passenger) {
      return res.status(400).json({ message: "Passenger not found" });
    }
    const isValidOTP = String(otp) === String(passenger.userOTP);
    if (!isValidOTP) {
      return res.status(400).json({ message: "Invalid OTP" });
    }
    passenger.isConfirmed = true;
    await passenger.save();
    return res
      .status(200)
      .json({ success: true, message: "Your account is confirmed" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};